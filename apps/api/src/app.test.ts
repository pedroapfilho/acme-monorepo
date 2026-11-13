import { initApiLogger } from "@repo/observability/hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createApp } from "./app";
import type { AppDeps } from "./app";

const alice = { email: "alice@example.com", id: "user-1" };

const signedIn = { Authorization: `Bearer ${alice.id}` };

vi.stubEnv("NODE_ENV", "production");

initApiLogger({ service: "api" });

vi.unstubAllEnvs();

const infoLogs = vi.spyOn(console, "info").mockImplementation(() => undefined);

vi.spyOn(console, "warn").mockImplementation(() => undefined);

vi.spyOn(console, "error").mockImplementation(() => undefined);

const wideEventFor = (path: string) =>
  infoLogs.mock.calls
    .map(([line]) => JSON.parse(String(line)) as { path?: string; userId?: string })
    .find((event) => event.path === path);

const userIdFrom = (headers: Headers) => headers.get("authorization")?.replace("Bearer ", "") ?? "";

const setup = (overrides: Partial<AppDeps> = {}) => {
  const getSession = vi.fn<AppDeps["getSession"]>(({ headers }) =>
    Promise.resolve(
      userIdFrom(headers) === alice.id ? { session: { id: "session-1" }, user: alice } : null,
    ),
  );

  const app = createApp({
    checkDatabase: () => Promise.resolve(),
    corsOrigins: ["https://acme.web.localhost"],
    getSession,
    isProduction: false,
    sessionCookieName: "__Secure-acme.session_token",
    trustedProxyHops: 0,
    ...overrides,
  });

  const request = (path: string, init: RequestInit = {}, remoteAddress = "203.0.113.10") =>
    app.request(path, init, { incoming: { socket: { remoteAddress } } });

  return { getSession, request };
};

describe("createApp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("health", () => {
    it("answers /healthz without looking up a session", async () => {
      const { getSession, request } = setup();

      const res = await request("/healthz", { headers: signedIn });

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({
        service: "api",
        status: "healthy",
        timestamp: expect.any(String),
        version: "1.0.0",
      });
      expect(getSession).not.toHaveBeenCalled();
      expect(wideEventFor("/healthz")).toBeDefined();
      expect(wideEventFor("/healthz")?.userId).toBeUndefined();
    });

    it("reports not ready when the database check fails", async () => {
      const { request } = setup({
        checkDatabase: () => Promise.reject(new Error("connection refused")),
      });

      const res = await request("/readyz");

      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({
        checks: { database: "unhealthy" },
        status: "not ready",
        timestamp: expect.any(String),
      });
    });
  });

  describe("session", () => {
    it("serves the signed-in user and identifies them on the request's wide event", async () => {
      const { getSession, request } = setup();

      const res = await request("/api/v1/me", { headers: signedIn });

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ data: alice });
      expect(getSession).toHaveBeenCalledOnce();
      expect(wideEventFor("/api/v1/me")?.userId).toBe(alice.id);
    });

    it("rejects a request without a session with 401", async () => {
      const { request } = setup();

      const res = await request("/api/v1/me");

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({
        error: { code: "UNAUTHENTICATED", message: "Authentication required" },
      });
    });

    it("answers 503 when the session lookup throws", async () => {
      const { request } = setup({
        getSession: () => Promise.reject(new Error("database unreachable")),
      });

      const res = await request("/api/v1/me", { headers: signedIn });

      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({
        error: { code: "AUTH_UNAVAILABLE", message: "Authentication service unavailable" },
      });
    });

    it("leaves CORS preflights and unknown paths unauthenticated", async () => {
      const { getSession, request } = setup();

      const preflight = await request("/api/v1/me", {
        headers: {
          "Access-Control-Request-Method": "GET",
          Origin: "https://acme.web.localhost",
        },
        method: "OPTIONS",
      });

      const missing = await request("/api/v1/nope", { headers: signedIn });

      expect(preflight.status).toBe(204);
      expect(preflight.headers.get("access-control-allow-origin")).toBe(
        "https://acme.web.localhost",
      );
      expect(missing.status).toBe(404);
      expect(getSession).not.toHaveBeenCalled();
    });
  });

  it.each([false, true])(
    "rejects an oversize body with 413 before auth (content length: %s)",
    async (withLength) => {
      const { getSession, request } = setup();
      const body = JSON.stringify({ name: "x".repeat(10 * 1024 * 1024) });
      const headers = new Headers({ "Content-Type": "application/json", ...signedIn });

      if (withLength) {
        headers.set("Content-Length", String(body.length));
      }

      const res = await request("/api/v1/me", { body, headers, method: "POST" });

      expect(res.status).toBe(413);
      expect(await res.json()).toEqual({
        error: { code: "PAYLOAD_TOO_LARGE", message: "Request entity too large" },
      });
      expect(getSession).not.toHaveBeenCalled();
    },
  );

  it("answers unknown paths with the 404 envelope", async () => {
    const { request } = setup();

    const res = await request("/does-not-exist");

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: { code: "NOT_FOUND", message: "Resource not found" },
    });
  });

  describe("rate limiting", () => {
    const API_LIMIT = 30;

    const exhaust = async (
      request: ReturnType<typeof setup>["request"],
      forwardedFor: (attempt: number) => string,
    ) => {
      for (let attempt = 0; attempt < API_LIMIT; attempt += 1) {
        const res = await request("/api/v1/me", {
          headers: { ...signedIn, "X-Forwarded-For": forwardedFor(attempt) },
        });

        expect(res.status).toBe(200);
      }
    };

    it("keys on the socket address, ignoring a rotating X-Forwarded-For", async () => {
      const { request } = setup();

      await exhaust(request, (attempt) => `198.51.100.${attempt}`);

      const limited = await request("/api/v1/me", {
        headers: { ...signedIn, "X-Forwarded-For": "198.51.100.250" },
      });

      const otherClient = await request("/api/v1/me", { headers: signedIn }, "203.0.113.99");

      expect(limited.status).toBe(429);
      expect(limited.headers.get("retry-after")).not.toBeNull();
      expect(await limited.json()).toEqual({
        error: {
          code: "API_RATE_LIMIT_EXCEEDED",
          message: "API rate limit exceeded, please slow down",
        },
      });
      expect(otherClient.status).toBe(200);
    });

    it("keys on the address a trusted proxy appended, not on client-supplied entries", async () => {
      const { request } = setup({ trustedProxyHops: 1 });

      await exhaust(request, (attempt) => `10.0.0.${attempt}, 198.51.100.7`);

      const limited = await request("/api/v1/me", {
        headers: { ...signedIn, "X-Forwarded-For": "10.0.0.250, 198.51.100.7" },
      });

      const otherClient = await request("/api/v1/me", {
        headers: { ...signedIn, "X-Forwarded-For": "198.51.100.8" },
      });

      expect(limited.status).toBe(429);
      expect(otherClient.status).toBe(200);
    });

    it("keys on the address the outermost of two trusted proxies appended", async () => {
      const { request } = setup({ trustedProxyHops: 2 });

      await exhaust(request, (attempt) => `10.0.0.${attempt}, 198.51.100.7, 192.0.2.1`);

      const limited = await request("/api/v1/me", {
        headers: { ...signedIn, "X-Forwarded-For": "198.51.100.7, 192.0.2.2" },
      });

      const otherClient = await request("/api/v1/me", {
        headers: { ...signedIn, "X-Forwarded-For": "198.51.100.8, 192.0.2.1" },
      });

      expect(limited.status).toBe(429);
      expect(otherClient.status).toBe(200);
    });

    it("falls back to the socket address when fewer proxies appended than are trusted", async () => {
      const { request } = setup({ trustedProxyHops: 2 });

      await exhaust(request, (attempt) => `198.51.100.${attempt}`);

      const limited = await request("/api/v1/me", {
        headers: { ...signedIn, "X-Forwarded-For": "198.51.100.250" },
      });

      expect(limited.status).toBe(429);
    });
  });

  describe("OpenAPI document", () => {
    it("serves the Scalar page without the api's script-blocking CSP", async () => {
      const { request } = setup();

      const res = await request("/docs");

      expect(res.status).toBe(200);
      expect(res.headers.get("content-security-policy")).toBeNull();
    });

    it("declares session security and the shared error envelope on authenticated routes", async () => {
      const { request } = setup();

      const res = await request("/openapi.json");

      const doc = (await res.json()) as {
        components: {
          schemas: Record<string, { properties?: Record<string, unknown> }>;
          securitySchemes: Record<string, unknown>;
        };
        paths: Record<
          string,
          Record<string, { responses: Record<string, unknown>; security?: unknown }>
        >;
      };

      expect(doc.components.securitySchemes).toEqual({
        bearerAuth: { scheme: "bearer", type: "http" },
        sessionCookie: { in: "cookie", name: "__Secure-acme.session_token", type: "apiKey" },
      });
      expect(doc.components.schemas.Error?.properties?.error).toMatchObject({
        properties: { code: expect.anything(), message: expect.anything() },
        type: "object",
      });

      const getMe = doc.paths["/api/v1/me"]?.get;
      expect(getMe?.security).toEqual([{ bearerAuth: [] }, { sessionCookie: [] }]);

      for (const status of ["401", "429", "503"]) {
        expect(getMe?.responses[status]).toMatchObject({
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        });
      }

      expect(doc.paths["/healthz"]?.get?.security).toBeUndefined();
    });

    it("publishes the document as markdown at /llms.txt", async () => {
      const { request } = setup();

      const res = await request("/llms.txt");

      expect(res.status).toBe(200);
      expect(await res.text()).toContain("Acme API");
    });
  });
});
