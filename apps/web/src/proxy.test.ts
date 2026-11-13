// @vitest-environment node
import { log } from "@repo/observability";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createProxy } from "./proxy";

const lookup = vi.fn();
const proxy = createProxy(lookup);

const requestFor = (path: string) => new NextRequest(new URL(path, "https://acme.web.localhost"));

describe("proxy", () => {
  beforeEach(() => {
    lookup.mockReset().mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(["/dashboard/settings", "/dashboard/settings/profile"])(
    "sends signed-out visitors from %s to login",
    async (path) => {
      const response = await proxy(requestFor(path));

      expect(response.status).toBe(307);
      const destination = new URL(response.headers.get("location") ?? "");
      expect(destination.pathname).toBe("/login");
      expect(destination.searchParams.get("from")).toBe(path);
    },
  );

  it.each([
    { destination: "/login", session: null },
    { destination: "/dashboard", session: { user: { id: "user_1" } } },
  ])("sends root visitors to $destination", async ({ destination, session }) => {
    lookup.mockResolvedValue(session);

    const response = await proxy(requestFor("/"));

    expect(response.headers.get("location")).toBe(`https://acme.web.localhost${destination}`);
  });

  it("sends signed-out dashboard visitors to login without a redundant return destination", async () => {
    const response = await proxy(requestFor("/dashboard"));

    expect(response.headers.get("location")).toBe("https://acme.web.localhost/login");
  });

  it("preserves query parameters in the return destination", async () => {
    const path = "/dashboard/settings?tab=security&filter=name%2Bemail";

    const response = await proxy(requestFor(path));

    const destination = new URL(response.headers.get("location") ?? "");
    expect(destination.searchParams.get("from")).toBe(path);
    expect([...destination.searchParams.keys()]).toEqual(["from"]);
  });

  it.each([
    "/dashboardx",
    "/login-help",
    "/login/help",
    "/register-help",
    "/register/help",
    "/recover-help",
    "/recover/help",
    "/reset-password",
    "/profile",
    "/settings",
  ])("leaves %s public without looking up a session", async (path) => {
    const response = await proxy(requestFor(path));

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(lookup).not.toHaveBeenCalled();
  });

  it.each(["/login", "/register", "/recover"])(
    "sends signed-in visitors from %s to the dashboard",
    async (path) => {
      lookup.mockResolvedValue({ user: { id: "user_1" } });

      const response = await proxy(requestFor(path));

      expect(response.headers.get("location")).toBe("https://acme.web.localhost/dashboard");
    },
  );

  it.each(["/login", "/register", "/recover"])("allows signed-out visitors to %s", async (path) => {
    const response = await proxy(requestFor(path));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("allows a signed-in visitor to a protected page", async () => {
    lookup.mockResolvedValue({ user: { id: "user_1" } });

    const response = await proxy(requestFor("/dashboard/settings"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it.each(["/", "/login", "/dashboard/settings?tab=security"])(
    "answers %s with an uncached 503 when the session lookup fails",
    async (path) => {
      lookup.mockRejectedValue(new Error("Database unavailable"));
      const logError = vi.spyOn(log, "error").mockImplementation(() => undefined);

      const response = await proxy(requestFor(path));

      expect(response.status).toBe(503);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(response.headers.get("location")).toBeNull();
      expect(logError).toHaveBeenCalledWith({
        error: expect.objectContaining({ message: "Database unavailable" }),
        message: "Proxy: failed to look up session",
      });
    },
  );
});
