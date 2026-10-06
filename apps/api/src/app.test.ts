import { initApiLogger } from "@repo/observability/hono";
import { APIError } from "better-auth/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createApp } from "./app";
import type { AppDeps } from "./app";
import type { User, UserStore } from "./lib/users";

const alice: User = {
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  displayName: "Alice",
  email: "alice@example.com",
  emailVerified: true,
  id: "user-1",
  name: "Alice",
  updatedAt: new Date("2024-01-02T00:00:00.000Z"),
  username: "alice",
};

const serializedAlice = {
  ...alice,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
};

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

const createInMemoryUsers = () => {
  const rows = new Map([[alice.id, { ...alice }]]);

  const users: UserStore = {
    delete: ({ headers }) => {
      rows.delete(userIdFrom(headers));
      return Promise.resolve(new Headers());
    },
    find: (id) => Promise.resolve(rows.get(id) ?? null),
    update: ({ data, headers }) => {
      const current = rows.get(userIdFrom(headers));
      if (current) {
        rows.set(current.id, { ...current, ...data });
      }
      return Promise.resolve(new Headers());
    },
  };

  return { rows, users };
};

const setup = (overrides: Partial<AppDeps> = {}) => {
  const { rows, users } = createInMemoryUsers();
  const getSession = vi.fn<AppDeps["getSession"]>(({ headers }) => {
    const user = rows.get(userIdFrom(headers));
    return Promise.resolve(user ? { session: { id: "session-1" }, user } : null);
  });

  const app = createApp({
    checkDatabase: () => Promise.resolve(),
    corsOrigins: ["https://acme.web.localhost"],
    getSession,
    isProduction: false,
    sessionCookieName: "__Secure-acme.session_token",
    trustProxy: false,
    users,
    ...overrides,
  });

  const request = (path: string, init: RequestInit = {}, remoteAddress = "203.0.113.10") =>
    app.request(path, init, { incoming: { socket: { remoteAddress } } });

  return { getSession, request, rows };
};

const json = (
  body: { name?: string; password?: string; username?: string },
  headers: Record<string, string> = signedIn,
) => ({
  body: JSON.stringify(body),
  headers: { "Content-Type": "application/json", ...headers },
});

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

      const res = await request("/api/v1/users/me", { headers: signedIn });

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ data: serializedAlice });
      expect(getSession).toHaveBeenCalledOnce();
      expect(wideEventFor("/api/v1/users/me")?.userId).toBe(alice.id);
    });

    it("rejects a request without a session with 401", async () => {
      const { request } = setup();

      const res = await request("/api/v1/users/me");

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({
        error: { code: "UNAUTHENTICATED", message: "Authentication required" },
      });
    });

    it("answers 503 when the session lookup throws", async () => {
      const { request } = setup({
        getSession: () => Promise.reject(new Error("database unreachable")),
      });

      const res = await request("/api/v1/users/me", { headers: signedIn });

      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({
        error: { code: "AUTH_UNAVAILABLE", message: "Authentication service unavailable" },
      });
    });

    it("leaves CORS preflights and unknown paths unauthenticated", async () => {
      const { getSession, request } = setup();

      const preflight = await request("/api/v1/users/me", {
        headers: {
          "Access-Control-Request-Method": "PATCH",
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

  describe("PATCH /api/v1/users/me", () => {
    it("rejects an invalid body with the validation envelope", async () => {
      const { request, rows } = setup();

      const res = await request("/api/v1/users/me", {
        ...json({ name: "" }),
        method: "PATCH",
      });

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          details: [{ field: "name", message: expect.any(String) }],
          message: "Validation failed",
        },
      });
      expect(rows.get(alice.id)?.name).toBe("Alice");
    });

    it("rejects an update with no fields", async () => {
      const { request } = setup();

      const res = await request("/api/v1/users/me", { ...json({}), method: "PATCH" });

      expect(res.status).toBe(400);
      expect(await res.json()).toMatchObject({ error: { code: "VALIDATION_ERROR" } });
    });

    it("rejects malformed JSON with the error envelope", async () => {
      const { request } = setup();

      const res = await request("/api/v1/users/me", {
        body: "{",
        headers: { "Content-Type": "application/json", ...signedIn },
        method: "PATCH",
      });

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({
        error: { code: "VALIDATION_ERROR", message: expect.any(String) },
      });
    });

    it("writes through the user store and returns the stored user", async () => {
      const { request } = setup();

      const res = await request("/api/v1/users/me", {
        ...json({ name: "Alice Liddell" }),
        method: "PATCH",
      });

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ data: { ...serializedAlice, name: "Alice Liddell" } });
    });

    it("relays account-rule rejections with their status and code", async () => {
      const { request } = setup({
        users: {
          ...createInMemoryUsers().users,
          update: () =>
            Promise.reject(
              new APIError("BAD_REQUEST", {
                code: "USERNAME_IS_ALREADY_TAKEN",
                message: "Username is already taken. Please try another.",
              }),
            ),
        },
      });

      const res = await request("/api/v1/users/me", {
        ...json({ username: "bob" }),
        method: "PATCH",
      });

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({
        error: {
          code: "USERNAME_IS_ALREADY_TAKEN",
          message: "Username is already taken. Please try another.",
        },
      });
    });

    it("maps a unique-constraint race to 409", async () => {
      const { request } = setup({
        users: {
          ...createInMemoryUsers().users,
          update: () =>
            Promise.reject(
              Object.assign(new Error("Unique constraint failed"), {
                clientVersion: "7.0.0",
                code: "P2002",
              }),
            ),
        },
      });

      const res = await request("/api/v1/users/me", {
        ...json({ username: "bob" }),
        method: "PATCH",
      });

      expect(res.status).toBe(409);
      expect(await res.json()).toEqual({
        error: { code: "DUPLICATE_ENTRY", message: "A record with this value already exists" },
      });
    });

    it.each([false, true])(
      "rejects an oversize body with 413 before auth (content length: %s)",
      async (withLength) => {
        const { getSession, request, rows } = setup();
        const body = JSON.stringify({ name: "x".repeat(10 * 1024 * 1024) });
        const headers = new Headers({ "Content-Type": "application/json", ...signedIn });
        if (withLength) {
          headers.set("Content-Length", String(body.length));
        }

        const res = await request("/api/v1/users/me", { body, headers, method: "PATCH" });

        expect(res.status).toBe(413);
        expect(await res.json()).toEqual({
          error: { code: "PAYLOAD_TOO_LARGE", message: "Request entity too large" },
        });
        expect(getSession).not.toHaveBeenCalled();
        expect(rows.get(alice.id)?.name).toBe("Alice");
      },
    );
  });

  it.each(["PATCH", "DELETE"])("forwards every Set-Cookie header after %s", async (method) => {
    const cookies = [
      "acme.session_token=token; Path=/; HttpOnly; SameSite=Lax",
      "acme.session_data=cache; Expires=Wed, 21 Oct 2026 07:28:00 GMT; Path=/; HttpOnly",
    ];
    const headers = new Headers(cookies.map((cookie) => ["Set-Cookie", cookie]));
    const { request } = setup({
      users: {
        ...createInMemoryUsers().users,
        delete: () => Promise.resolve(headers),
        update: () => Promise.resolve(headers),
      },
    });

    const res = await request("/api/v1/users/me", { ...json({ name: "Alice" }), method });

    expect(res.status).toBe(method === "PATCH" ? 200 : 204);
    expect(res.headers.getSetCookie()).toEqual(cookies);
  });

  describe("DELETE /api/v1/users/me", () => {
    it("deletes the account and answers 204 with no body", async () => {
      const { request, rows } = setup();

      const res = await request("/api/v1/users/me", {
        ...json({ password: "correct horse battery" }),
        method: "DELETE",
      });

      expect(res.status).toBe(204);
      expect(await res.text()).toBe("");
      expect(rows.has(alice.id)).toBe(false);
    });
  });

  describe("GET /api/v1/users", () => {
    it("returns the list envelope", async () => {
      const { request } = setup();

      const res = await request("/api/v1/users", { headers: signedIn });

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({
        data: [serializedAlice],
        meta: { page: 1, total: 1, totalPages: 1 },
      });
    });
  });

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
        const res = await request("/api/v1/users/me", {
          headers: { ...signedIn, "X-Forwarded-For": forwardedFor(attempt) },
        });
        expect(res.status).toBe(200);
      }
    };

    it("keys on the socket address, ignoring a rotating X-Forwarded-For", async () => {
      const { request } = setup();

      await exhaust(request, (attempt) => `198.51.100.${attempt}`);
      const limited = await request("/api/v1/users/me", {
        headers: { ...signedIn, "X-Forwarded-For": "198.51.100.250" },
      });
      const otherClient = await request("/api/v1/users/me", { headers: signedIn }, "203.0.113.99");

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
      const { request } = setup({ trustProxy: true });

      await exhaust(request, (attempt) => `10.0.0.${attempt}, 198.51.100.7`);
      const limited = await request("/api/v1/users/me", {
        headers: { ...signedIn, "X-Forwarded-For": "10.0.0.250, 198.51.100.7" },
      });
      const otherClient = await request("/api/v1/users/me", {
        headers: { ...signedIn, "X-Forwarded-For": "198.51.100.8" },
      });

      expect(limited.status).toBe(429);
      expect(otherClient.status).toBe(200);
    });
  });

  describe("OpenAPI document", () => {
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

      const patchMe = doc.paths["/api/v1/users/me"]?.patch;
      expect(patchMe?.security).toEqual([{ bearerAuth: [] }, { sessionCookie: [] }]);
      for (const status of ["400", "401", "413", "429", "503"]) {
        expect(patchMe?.responses[status]).toMatchObject({
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
