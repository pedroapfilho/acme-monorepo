import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";

import { env } from "@/lib/env";
import { extractPgCode } from "@/lib/pg-error";

class AppError extends Error {
  public readonly statusCode: ContentfulStatusCode;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: ContentfulStatusCode = 500,
    isOperational: boolean = true,
    code?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err: Error, c: Context) => {
  c.get("log").error(err, {
    ip: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
    method: c.req.method,
    url: c.req.url,
    userAgent: c.req.header("user-agent"),
  });

  if (err instanceof HTTPException) {
    return c.json(
      {
        error: {
          code: "HTTP_EXCEPTION",
          message: err.message,
        },
      },
      err.status,
    );
  }

  if (err instanceof ZodError) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          details: err.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
          message: "Validation failed",
        },
      },
      400 as const,
    );
  }

  if (err instanceof AppError) {
    return c.json(
      {
        error: {
          code: err.code || "APP_ERROR",
          message: err.message,
        },
      },
      err.statusCode,
    );
  }

  const pgCode = extractPgCode(err);
  if (pgCode === "23505") {
    return c.json({ error: { code: "DUPLICATE_ENTRY", message: "Resource already exists" } }, 409);
  }
  if (pgCode === "23503") {
    return c.json(
      { error: { code: "FOREIGN_KEY_VIOLATION", message: "Referenced resource not found" } },
      409,
    );
  }
  if (pgCode === "23502") {
    return c.json(
      { error: { code: "NOT_NULL_VIOLATION", message: "Required field missing" } },
      400,
    );
  }

  const message = env.NODE_ENV === "production" ? "An unexpected error occurred" : err.message;

  return c.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message,
        ...(env.NODE_ENV !== "production" && { stack: err.stack }),
      },
    },
    500 as const,
  );
};

const notFound = (c: Context) => {
  return c.json(
    {
      error: {
        code: "NOT_FOUND",
        message: "Resource not found",
      },
    },
    404 as const,
  );
};

export { AppError, errorHandler, notFound };
