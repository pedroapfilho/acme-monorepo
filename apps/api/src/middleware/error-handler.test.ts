import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

vi.mock("@/lib/env", () => ({
  env: { NODE_ENV: "development" },
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn() },
}));

import { env } from "@/lib/env";

import { AppError, errorHandler, notFound } from "./error-handler";

const createMockContext = (headers: Record<string, string> = {}) => {
  return {
    json: vi.fn((body: unknown, status?: number) => ({ body, status })),
    req: {
      header: vi.fn((name: string) => headers[name]),
      method: "GET",
      url: "http://localhost/test",
    },
  } as unknown as Context & { json: ReturnType<typeof vi.fn> };
};

describe("AppError", () => {
  it("should use default statusCode 500 and isOperational true", () => {
    const error = new AppError("Something broke");
    expect(error.message).toBe("Something broke");
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
    expect(error.code).toBeUndefined();
  });

  it("should accept custom statusCode and isOperational", () => {
    const error = new AppError("Not found", 404, false);
    expect(error.statusCode).toBe(404);
    expect(error.isOperational).toBe(false);
  });

  it("should accept optional error code", () => {
    const error = new AppError("Bad", 400, true, "VALIDATION_FAILED");
    expect(error.code).toBe("VALIDATION_FAILED");
  });

  it("should have a stack trace", () => {
    const error = new AppError("Test");
    expect(error.stack).toBeDefined();
  });
});

describe("errorHandler", () => {
  it("should handle HTTPException", async () => {
    const c = createMockContext();
    const err = new HTTPException(403, { message: "Forbidden" });

    await errorHandler(err, c);

    expect(c.json).toHaveBeenCalledWith(
      { error: { code: "HTTP_EXCEPTION", message: "Forbidden" } },
      403,
    );
  });

  it("should handle ZodError with field details", async () => {
    const c = createMockContext();
    const err = new ZodError([
      {
        code: "too_small",
        inclusive: true,
        message: "Required",
        minimum: 1,
        path: ["name"],
        type: "string",
      },
    ]);

    await errorHandler(err, c);

    expect(c.json).toHaveBeenCalledWith(
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

  it("should handle AppError with custom code", async () => {
    const c = createMockContext();
    const err = new AppError("User not found", 404, true, "USER_NOT_FOUND");

    await errorHandler(err, c);

    expect(c.json).toHaveBeenCalledWith(
      { error: { code: "USER_NOT_FOUND", message: "User not found" } },
      404,
    );
  });

  it("should handle AppError without code defaulting to APP_ERROR", async () => {
    const c = createMockContext();
    const err = new AppError("Something wrong", 422);

    await errorHandler(err, c);

    expect(c.json).toHaveBeenCalledWith(
      { error: { code: "APP_ERROR", message: "Something wrong" } },
      422,
    );
  });

  it("should handle P2002 as 409 DUPLICATE_ENTRY", async () => {
    const c = createMockContext();
    const err = new Error("Unique constraint failed P2002");

    await errorHandler(err, c);

    expect(c.json).toHaveBeenCalledWith(
      { error: { code: "DUPLICATE_ENTRY", message: "A record with this value already exists" } },
      409,
    );
  });

  it("should handle P2025 as 404 NOT_FOUND", async () => {
    const c = createMockContext();
    const err = new Error("Record not found P2025");

    await errorHandler(err, c);

    expect(c.json).toHaveBeenCalledWith(
      { error: { code: "NOT_FOUND", message: "Record not found" } },
      404,
    );
  });

  it("should include error message and stack in development", async () => {
    const c = createMockContext();
    const err = new Error("dev error");

    await errorHandler(err, c);

    const call = c.json.mock.calls[0];
    expect(call?.[0]?.error?.message).toBe("dev error");
    expect(call?.[0]?.error?.stack).toBeDefined();
    expect(call?.[1]).toBe(500);
  });

  it("should hide error message in production", async () => {
    const mutableEnv = env as { NODE_ENV: string };
    mutableEnv.NODE_ENV = "production";

    const c = createMockContext();
    const err = new Error("secret detail");

    await errorHandler(err, c);

    const call = c.json.mock.calls[0];
    expect(call?.[0]?.error?.message).toBe("An unexpected error occurred");
    expect(call?.[0]?.error?.stack).toBeUndefined();

    mutableEnv.NODE_ENV = "development";
  });
});

describe("notFound", () => {
  it("should return 404 with NOT_FOUND code", () => {
    const c = createMockContext();

    notFound(c);

    expect(c.json).toHaveBeenCalledWith(
      { error: { code: "NOT_FOUND", message: "Resource not found" } },
      404,
    );
  });
});
