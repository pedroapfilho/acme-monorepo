import type { Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAuthMiddleware } from "./auth";
import type { GetSession } from "./auth";
import { createMockContext } from "./test-helpers";

const getSession = vi.fn<GetSession>();
const authMiddleware = createAuthMiddleware(getSession);

const mockSession = {
  session: { id: "session-1" },
  user: {
    email: "test@example.com",
    id: "user-1",
  },
};

describe("authMiddleware", () => {
  const next: Next = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets user on context when session is valid", async () => {
    getSession.mockResolvedValue(mockSession);
    const { ctx, mocks } = createMockContext({ headers: { Authorization: "Bearer token123" } });

    await authMiddleware(ctx, next);

    expect(mocks.set).toHaveBeenCalledWith("user", {
      email: "test@example.com",
      id: "user-1",
    });
    expect(next).toHaveBeenCalled();
  });

  it("forwards Authorization header to getSession", async () => {
    getSession.mockResolvedValue(mockSession);
    const { ctx } = createMockContext({ headers: { Authorization: "Bearer abc" } });

    await authMiddleware(ctx, next);

    const calledHeaders = getSession.mock.calls[0]?.[0]?.headers;
    expect(calledHeaders?.get("Authorization")).toBe("Bearer abc");
  });

  it("forwards Cookie header to getSession", async () => {
    getSession.mockResolvedValue(mockSession);
    const { ctx } = createMockContext({ headers: { Cookie: "session=abc123" } });

    await authMiddleware(ctx, next);

    const calledHeaders = getSession.mock.calls[0]?.[0]?.headers;
    expect(calledHeaders?.get("Cookie")).toBe("session=abc123");
  });

  it("forwards request metadata needed by auth plugins", async () => {
    getSession.mockResolvedValue(mockSession);
    const { ctx } = createMockContext({ headers: { "User-Agent": "Acme test" } });

    await authMiddleware(ctx, next);

    const calledHeaders = getSession.mock.calls[0]?.[0]?.headers;
    expect(calledHeaders?.get("User-Agent")).toBe("Acme test");
  });

  it("throws 401 when session is null", async () => {
    getSession.mockResolvedValue(null);
    const { ctx } = createMockContext();

    await expect(authMiddleware(ctx, next)).rejects.toThrow(HTTPException);
    await expect(authMiddleware(ctx, next)).rejects.toMatchObject({
      status: 401,
    });
  });

  it("throws 401 when session has no user", async () => {
    getSession.mockResolvedValue({ user: null });
    const { ctx } = createMockContext();

    await expect(authMiddleware(ctx, next)).rejects.toThrow(HTTPException);
  });

  it("throws 503 when getSession throws", async () => {
    getSession.mockRejectedValue(new Error("DB down"));
    const { ctx, mocks } = createMockContext();

    await expect(authMiddleware(ctx, next)).rejects.toThrow(HTTPException);
    await expect(authMiddleware(ctx, next)).rejects.toMatchObject({
      status: 503,
    });
    expect(mocks.loggerError).toHaveBeenCalled();
  });
});
