import type { Context, Next } from "hono";
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

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn() },
}));

import { auth } from "@/lib/auth";

import { authMiddleware, optionalAuthMiddleware } from "./auth";

const createMockContext = (headers: Record<string, string> = {}) => {
  const variables = new Map<string, unknown>();

  return {
    get: vi.fn((key: string) => variables.get(key)),
    req: {
      header: vi.fn((name: string) => headers[name]),
      method: "GET",
      path: "/test",
      url: "http://localhost/test",
    },
    set: vi.fn((key: string, value: unknown) => {
      variables.set(key, value);
    }),
  } as unknown as Context;
};

const mockSession = {
  session: { id: "session-1" },
  user: {
    displayName: "Test User",
    email: "test@example.com",
    id: "user-1",
    username: "testuser",
  },
};

describe("authMiddleware", () => {
  const next: Next = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should set user on context when session is valid", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    const c = createMockContext({ Authorization: "Bearer token123" });

    await authMiddleware(c, next);

    expect(c.set).toHaveBeenCalledWith("user", {
      displayName: "Test User",
      email: "test@example.com",
      id: "user-1",
      username: "testuser",
    });
    expect(next).toHaveBeenCalled();
  });

  it("should forward Authorization header to getSession", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    const c = createMockContext({ Authorization: "Bearer abc" });

    await authMiddleware(c, next);

    const calledHeaders = vi.mocked(auth.api.getSession).mock.calls[0]?.[0]?.headers;
    expect(calledHeaders?.get("Authorization")).toBe("Bearer abc");
  });

  it("should forward Cookie header to getSession", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    const c = createMockContext({ Cookie: "session=abc123" });

    await authMiddleware(c, next);

    const calledHeaders = vi.mocked(auth.api.getSession).mock.calls[0]?.[0]?.headers;
    expect(calledHeaders?.get("Cookie")).toBe("session=abc123");
  });

  it("should throw 401 when session is null", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never);
    const c = createMockContext();

    await expect(authMiddleware(c, next)).rejects.toThrow(HTTPException);
    await expect(authMiddleware(c, next)).rejects.toMatchObject({
      status: 401,
    });
  });

  it("should throw 401 when session has no user", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ session: {}, user: null } as never);
    const c = createMockContext();

    await expect(authMiddleware(c, next)).rejects.toThrow(HTTPException);
  });

  it("should throw 503 when getSession throws", async () => {
    vi.mocked(auth.api.getSession).mockRejectedValue(new Error("DB down"));
    const c = createMockContext();

    await expect(authMiddleware(c, next)).rejects.toThrow(HTTPException);
    await expect(authMiddleware(c, next)).rejects.toMatchObject({
      status: 503,
    });
  });
});

describe("optionalAuthMiddleware", () => {
  const next: Next = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should set user when session is valid", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    const c = createMockContext({ Authorization: "Bearer token" });

    await optionalAuthMiddleware(c, next);

    expect(c.set).toHaveBeenCalledWith("user", {
      displayName: "Test User",
      email: "test@example.com",
      id: "user-1",
      username: "testuser",
    });
    expect(next).toHaveBeenCalled();
  });

  it("should call next without setting user when session is null", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never);
    const c = createMockContext();

    await optionalAuthMiddleware(c, next);

    expect(c.set).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should call next without setting user when getSession throws", async () => {
    vi.mocked(auth.api.getSession).mockRejectedValue(new Error("DB down"));
    const c = createMockContext();

    await optionalAuthMiddleware(c, next);

    expect(c.set).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should not set user when session exists but user is null", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ session: {}, user: null } as never);
    const c = createMockContext();

    await optionalAuthMiddleware(c, next);

    expect(c.set).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
