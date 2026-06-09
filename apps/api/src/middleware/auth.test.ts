import type { Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/lib/env", () => ({
  env: { NODE_ENV: "test" },
}));

import { auth } from "@/lib/auth";

import { authMiddleware, optionalAuthMiddleware } from "./auth";
import { createMockContext } from "./test-helpers";

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
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    const { ctx, mocks } = createMockContext({ headers: { Authorization: "Bearer token123" } });

    await authMiddleware(ctx, next);

    expect(mocks.set).toHaveBeenCalledWith("user", {
      email: "test@example.com",
      id: "user-1",
    });
    expect(next).toHaveBeenCalled();
  });

  it("forwards Authorization header to getSession", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    const { ctx } = createMockContext({ headers: { Authorization: "Bearer abc" } });

    await authMiddleware(ctx, next);

    const calledHeaders = vi.mocked(auth.api.getSession).mock.calls[0]?.[0]?.headers;
    expect(calledHeaders?.get("Authorization")).toBe("Bearer abc");
  });

  it("forwards Cookie header to getSession", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    const { ctx } = createMockContext({ headers: { Cookie: "session=abc123" } });

    await authMiddleware(ctx, next);

    const calledHeaders = vi.mocked(auth.api.getSession).mock.calls[0]?.[0]?.headers;
    expect(calledHeaders?.get("Cookie")).toBe("session=abc123");
  });

  it("throws 401 when session is null", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never);
    const { ctx } = createMockContext();

    await expect(authMiddleware(ctx, next)).rejects.toThrow(HTTPException);
    await expect(authMiddleware(ctx, next)).rejects.toMatchObject({
      status: 401,
    });
  });

  it("throws 401 when session has no user", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ session: {}, user: null } as never);
    const { ctx } = createMockContext();

    await expect(authMiddleware(ctx, next)).rejects.toThrow(HTTPException);
  });

  it("throws 503 when getSession throws", async () => {
    vi.mocked(auth.api.getSession).mockRejectedValue(new Error("DB down"));
    const { ctx, mocks } = createMockContext();

    await expect(authMiddleware(ctx, next)).rejects.toThrow(HTTPException);
    await expect(authMiddleware(ctx, next)).rejects.toMatchObject({
      status: 503,
    });
    expect(mocks.loggerError).toHaveBeenCalled();
  });
});

describe("optionalAuthMiddleware", () => {
  const next: Next = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets user when session is valid", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    const { ctx, mocks } = createMockContext({ headers: { Authorization: "Bearer token" } });

    await optionalAuthMiddleware(ctx, next);

    expect(mocks.set).toHaveBeenCalledWith("user", {
      email: "test@example.com",
      id: "user-1",
    });
    expect(next).toHaveBeenCalled();
  });

  it("calls next without setting user when session is null", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never);
    const { ctx, mocks } = createMockContext();

    await optionalAuthMiddleware(ctx, next);

    expect(mocks.set).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("calls next without setting user when getSession throws", async () => {
    vi.mocked(auth.api.getSession).mockRejectedValue(new Error("DB down"));
    const { ctx, mocks } = createMockContext();

    await optionalAuthMiddleware(ctx, next);

    expect(mocks.set).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("does not set user when session exists but user is null", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ session: {}, user: null } as never);
    const { ctx, mocks } = createMockContext();

    await optionalAuthMiddleware(ctx, next);

    expect(mocks.set).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
