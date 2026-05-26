import { describe, expect, it, vi } from "vitest";

import { requestSizeLimit } from "./security";
import { createMockContext } from "./test-helpers";

describe("requestSizeLimit", () => {
  const next = vi.fn();

  it("rejects requests exceeding max size", async () => {
    const middleware = requestSizeLimit(1024);
    const { ctx, mocks } = createMockContext({ headers: { "content-length": "2048" } });

    await middleware(ctx, next);

    expect(mocks.json).toHaveBeenCalledWith(
      { error: { code: "PAYLOAD_TOO_LARGE", message: "Request entity too large" } },
      413,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("passes requests within size limit", async () => {
    const middleware = requestSizeLimit(1024);
    const { ctx } = createMockContext({ headers: { "content-length": "512" } });

    await middleware(ctx, next);

    expect(next).toHaveBeenCalled();
  });

  it("passes requests with no content-length header", async () => {
    const middleware = requestSizeLimit(1024);
    const { ctx } = createMockContext();

    await middleware(ctx, next);

    expect(next).toHaveBeenCalled();
  });

  it("uses default 10MB limit when no argument provided", async () => {
    const middleware = requestSizeLimit();
    const { ctx } = createMockContext({ headers: { "content-length": "5000000" } });

    await middleware(ctx, next);

    expect(next).toHaveBeenCalled();
  });

  it("rejects when exceeding default 10MB limit", async () => {
    const middleware = requestSizeLimit();
    const { ctx, mocks } = createMockContext({ headers: { "content-length": "20000000" } });

    await middleware(ctx, next);

    expect(mocks.json).toHaveBeenCalledWith(
      { error: { code: "PAYLOAD_TOO_LARGE", message: "Request entity too large" } },
      413,
    );
  });
});
