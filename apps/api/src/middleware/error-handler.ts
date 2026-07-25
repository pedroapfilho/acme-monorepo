import type { Prisma } from "@repo/db";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";

import { env } from "@/lib/env";

const isPrismaKnownError = (
  err: unknown,
): err is InstanceType<typeof Prisma.PrismaClientKnownRequestError> =>
  err instanceof Error && "code" in err && "clientVersion" in err;

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
  const forwardedFor = c.req.header("x-forwarded-for");
  c.get("log").error(err, {
    ip:
      forwardedFor !== undefined && forwardedFor !== "" ? forwardedFor : c.req.header("x-real-ip"),
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
          code: err.code !== undefined && err.code !== "" ? err.code : "APP_ERROR",
          message: err.message,
        },
      },
      err.statusCode,
    );
  }

  if (isPrismaKnownError(err)) {
    if (err.code === "P2002") {
      return c.json(
        {
          error: {
            code: "DUPLICATE_ENTRY",
            message: "A record with this value already exists",
          },
        },
        409 as const,
      );
    }

    if (err.code === "P2025") {
      return c.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Record not found",
          },
        },
        404 as const,
      );
    }
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
