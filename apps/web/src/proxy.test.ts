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

  it.each(["/dashboard", "/dashboard/settings", "/dashboard/settings/profile"])(
    "sends signed-out visitors from %s to login",
    async (path) => {
      const response = await proxy(requestFor(path));

      expect(response.status).toBe(307);
      const destination = new URL(response.headers.get("location") ?? "");
      expect(destination.pathname).toBe("/login");
      expect(destination.searchParams.get("from")).toBe(path);
    },
  );

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

  it.each(["/login", "/register", "/recover"])(
    "logs a session failure and still renders %s",
    async (path) => {
      const error = new Error("Database unavailable");
      lookup.mockRejectedValue(error);
      const logError = vi.spyOn(log, "error");

      const response = await proxy(requestFor(path));

      expect(response.headers.get("x-middleware-next")).toBe("1");
      expect(logError).toHaveBeenCalledWith(
        expect.objectContaining({ cause: error, message: "Proxy: failed to look up session" }),
      );
    },
  );

  it("logs a session failure and redirects protected pages to login", async () => {
    const error = new Error("Database unavailable");
    lookup.mockRejectedValue(error);
    const logError = vi.spyOn(log, "error");

    const response = await proxy(requestFor("/dashboard/settings?tab=security"));

    const destination = new URL(response.headers.get("location") ?? "");
    expect(destination.pathname).toBe("/login");
    expect(destination.searchParams.get("from")).toBe("/dashboard/settings?tab=security");
    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({ cause: error, message: "Proxy: failed to look up session" }),
    );
  });
});
