import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = async (err: Error, c: Context) => {
  // Log the error
  logger.error({
    err,
    method: c.req.method,
    url: c.req.url,
    ip: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
    userAgent: c.req.header("user-agent"),
  });

  // Handle different error types
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: {
          message: err.message,
          code: "HTTP_EXCEPTION",
        },
      },
      err.status
    );
  }

  if (err instanceof ZodError) {
    return c.json(
      {
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: err.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
      },
      400
    );
  }

  if (err instanceof AppError) {
    return c.json(
      {
        error: {
          message: err.message,
          code: err.code || "APP_ERROR",
        },
      },
      err.statusCode
    );
  }

  // Database errors
  if (err.message?.includes("P2002")) {
    return c.json(
      {
        error: {
          message: "A record with this value already exists",
          code: "DUPLICATE_ENTRY",
        },
      },
      409
    );
  }

  if (err.message?.includes("P2025")) {
    return c.json(
      {
        error: {
          message: "Record not found",
          code: "NOT_FOUND",
        },
      },
      404
    );
  }

  // Generic error response
  const message = env.NODE_ENV === "production" 
    ? "An unexpected error occurred" 
    : err.message;

  return c.json(
    {
      error: {
        message,
        code: "INTERNAL_SERVER_ERROR",
        ...(env.NODE_ENV !== "production" && { stack: err.stack }),
      },
    },
    500
  );
};

export const notFound = (c: Context) => {
  return c.json(
    {
      error: {
        message: "Resource not found",
        code: "NOT_FOUND",
      },
    },
    404
  );
};

// Async error wrapper for route handlers
export const asyncHandler = (fn: Function) => {
  return async (c: Context, next: Next) => {
    try {
      return await fn(c, next);
    } catch (error) {
      throw error;
    }
  };
};