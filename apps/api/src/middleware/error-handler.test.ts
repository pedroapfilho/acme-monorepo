import { HTTPException } from "hono/http-exception";
import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

vi.mock("@/lib/env", () => ({
  env: { NODE_ENV: "development" },
}));

import { env } from "@/lib/env";

import { AppError, errorHandler, notFound } from "./error-handler";
import { createMockContext } from "./test-helpers";

describe("AppError", () => {
  it("uses default statusCode 500 and isOperational true", () => {
    const error = new AppError("Something broke");
    expect(error.message).toBe("Something broke");
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
    expect(error.code).toBeUndefined();
  });

  it("accepts custom statusCode and isOperational", () => {
    const error = new AppError("Not found", 404, false);
    expect(error.statusCode).toBe(404);
    expect(error.isOperational).toBe(false);
  });

  it("accepts optional error code", () => {
    const error = new AppError("Bad", 400, true, "VALIDATION_FAILED");
    expect(error.code).toBe("VALIDATION_FAILED");
  });

  it("has a stack trace", () => {
    const error = new AppError("Test");
    expect(error.stack).toBeDefined();
  });
});

describe("errorHandler", () => {
  it("handles HTTPException", async () => {
    const { ctx, mocks } = createMockContext();
    const err = new HTTPException(403, { message: "Forbidden" });

    await errorHandler(err, ctx);

    expect(mocks.loggerError).toHaveBeenCalled();
    expect(mocks.json).toHaveBeenCalledWith(
      { error: { code: "HTTP_EXCEPTION", message: "Forbidden" } },
      403,
    );
  });

  it("handles ZodError with field details", async () => {
    const { ctx, mocks } = createMockContext();
    const err = new ZodError([
      {
        code: "too_small",
        inclusive: true,
        message: "Required",
        minimum: 1,
        origin: "string",
        path: ["name"],
      },
    ]);

    await errorHandler(err, ctx);

    expect(mocks.json).toHaveBeenCalledWith(
      {
        error: {
          code: "VALIDATION_ERROR",
          details: [{ field: "name", message: "Required" }],
          message: "Validation failed",
        },
      },
      400,
    );
  });

  it("handles AppError with custom code", async () => {
    const { ctx, mocks } = createMockContext();
    const err = new AppError("User not found", 404, true, "USER_NOT_FOUND");

    await errorHandler(err, ctx);

    expect(mocks.json).toHaveBeenCalledWith(
      { error: { code: "USER_NOT_FOUND", message: "User not found" } },
      404,
    );
  });

  it("handles AppError without code defaulting to APP_ERROR", async () => {
    const { ctx, mocks } = createMockContext();
    const err = new AppError("Something wrong", 422);

    await errorHandler(err, ctx);

    expect(mocks.json).toHaveBeenCalledWith(
      { error: { code: "APP_ERROR", message: "Something wrong" } },
      422,
    );
  });

  it("handles P2002 as 409 DUPLICATE_ENTRY", async () => {
    const { ctx, mocks } = createMockContext();
    const err = Object.assign(new Error("Unique constraint failed"), {
      clientVersion: "7.0.0",
      code: "P2002",
    });

    await errorHandler(err, ctx);

    expect(mocks.json).toHaveBeenCalledWith(
      { error: { code: "DUPLICATE_ENTRY", message: "A record with this value already exists" } },
      409,
    );
  });

  it("handles P2025 as 404 NOT_FOUND", async () => {
    const { ctx, mocks } = createMockContext();
    const err = Object.assign(new Error("Record not found"), {
      clientVersion: "7.0.0",
      code: "P2025",
    });

    await errorHandler(err, ctx);

    expect(mocks.json).toHaveBeenCalledWith(
      { error: { code: "NOT_FOUND", message: "Record not found" } },
      404,
    );
  });

  it("includes error message and stack in development", async () => {
    const { ctx, mocks } = createMockContext();
    const err = new Error("dev error");

    await errorHandler(err, ctx);

    const call = mocks.json.mock.calls[0];
    expect(call?.[0]?.error?.message).toBe("dev error");
    expect(call?.[0]?.error?.stack).toBeDefined();
    expect(call?.[1]).toBe(500);
  });

  it("hides error message in production", async () => {
    const mutableEnv = env as { NODE_ENV: string };
    mutableEnv.NODE_ENV = "production";

    const { ctx, mocks } = createMockContext();
    const err = new Error("secret detail");

    await errorHandler(err, ctx);

    const call = mocks.json.mock.calls[0];
    expect(call?.[0]?.error?.message).toBe("An unexpected error occurred");
    expect(call?.[0]?.error?.stack).toBeUndefined();

    mutableEnv.NODE_ENV = "development";
  });
});

describe("notFound", () => {
  it("returns 404 with NOT_FOUND code", () => {
    const { ctx, mocks } = createMockContext();

    notFound(ctx);

    expect(mocks.json).toHaveBeenCalledWith(
      { error: { code: "NOT_FOUND", message: "Resource not found" } },
      404,
    );
  });
});
