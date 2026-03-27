import type { Context } from "hono";
import { describe, expect, it, vi } from "vitest";

import { requestId, requestSizeLimit } from "./security";

const createMockContext = (options: { headers?: Record<string, string> } = {}) => {
  const { headers = {} } = options;
  const variables = new Map<string, unknown>();

  return {
    get: vi.fn((key: string) => variables.get(key)),
    header: vi.fn(),
    json: vi.fn((body: unknown, status?: number) => ({ body, status })),
    req: {
      header: vi.fn((name: string) => headers[name]),
      method: "GET",
      path: "/test",
      url: "http://localhost/test",
    },
    set: vi.fn((key: string, value: unknown) => {
      variables.set(key, value);
    }),
  } as unknown as Context & { json: ReturnType<typeof vi.fn> };
};

describe("requestSizeLimit", () => {
  const next = vi.fn();

  it("should reject requests exceeding max size", async () => {
    const middleware = requestSizeLimit(1024);
    const c = createMockContext({ headers: { "content-length": "2048" } });

    await middleware(c, next);

    expect(c.json).toHaveBeenCalledWith(
      { error: { code: "PAYLOAD_TOO_LARGE", message: "Request entity too large" } },
      413,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should pass requests within size limit", async () => {
    const middleware = requestSizeLimit(1024);
    const c = createMockContext({ headers: { "content-length": "512" } });

    await middleware(c, next);

    expect(next).toHaveBeenCalled();
  });

  it("should pass requests with no content-length header", async () => {
    const middleware = requestSizeLimit(1024);
    const c = createMockContext();

    await middleware(c, next);

    expect(next).toHaveBeenCalled();
  });

  it("should use default 10MB limit when no argument provided", async () => {
    const middleware = requestSizeLimit();
    const c = createMockContext({ headers: { "content-length": "5000000" } });

    await middleware(c, next);

    expect(next).toHaveBeenCalled();
  });

  it("should reject when exceeding default 10MB limit", async () => {
    const middleware = requestSizeLimit();
    const c = createMockContext({ headers: { "content-length": "20000000" } });

    await middleware(c, next);

    expect(c.json).toHaveBeenCalledWith(
      { error: { code: "PAYLOAD_TOO_LARGE", message: "Request entity too large" } },
      413,
    );
  });
});

describe("requestId", () => {
  const next = vi.fn();

  it("should use existing x-request-id header", async () => {
    const c = createMockContext({ headers: { "x-request-id": "existing-id" } });

    await requestId(c, next);

    expect(c.set).toHaveBeenCalledWith("requestId", "existing-id");
    expect(c.header).toHaveBeenCalledWith("x-request-id", "existing-id");
  });

  it("should generate UUID when no x-request-id header", async () => {
    const mockUuid = "generated-uuid-1234";
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      mockUuid as `${string}-${string}-${string}-${string}-${string}`,
    );

    const c = createMockContext();

    await requestId(c, next);

    expect(c.set).toHaveBeenCalledWith("requestId", mockUuid);
    expect(c.header).toHaveBeenCalledWith("x-request-id", mockUuid);

    vi.restoreAllMocks();
  });

  it("should call next", async () => {
    const c = createMockContext({ headers: { "x-request-id": "test" } });

    await requestId(c, next);

    expect(next).toHaveBeenCalled();
  });
});
