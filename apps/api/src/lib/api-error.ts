import { z } from "@hono/zod-openapi";
import type { Prisma } from "@repo/db";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";

const errorDetailSchema = z.object({ field: z.string(), message: z.string() });

const errorSchema = z
  .object({
    error: z.object({
      code: z.string(),
      details: z.array(errorDetailSchema).optional(),
      message: z.string(),
      stack: z.string().optional(),
    }),
  })
  .openapi("Error");

type ErrorBody = z.infer<typeof errorSchema>;

class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: ContentfulStatusCode;

  constructor(message: string, code: string, statusCode: ContentfulStatusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorBody = (code: string, message: string): ErrorBody => ({ error: { code, message } });

const isPrismaKnownError = (
  err: Error,
): err is InstanceType<typeof Prisma.PrismaClientKnownRequestError> =>
  "code" in err && "clientVersion" in err;

type ResolvedError = {
  body: ErrorBody;
  status: ContentfulStatusCode;
};

const resolveError = (err: Error, isProd: boolean): ResolvedError => {
  if (err instanceof HTTPException) {
    return { body: errorBody("HTTP_EXCEPTION", err.message), status: err.status };
  }

  if (err instanceof ZodError) {
    return {
      body: {
        error: {
          code: "VALIDATION_ERROR",
          details: err.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
          message: "Validation failed",
        },
      },
      status: 400,
    };
  }

  if (err instanceof AppError) {
    return { body: errorBody(err.code, err.message), status: err.statusCode };
  }

  if (isPrismaKnownError(err)) {
    if (err.code === "P2002") {
      return {
        body: errorBody("DUPLICATE_ENTRY", "A record with this value already exists"),
        status: 409,
      };
    }

    if (err.code === "P2025") {
      return { body: errorBody("NOT_FOUND", "Record not found"), status: 404 };
    }
  }

  const message = isProd ? "An unexpected error occurred" : err.message;

  return {
    body: {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message,
        ...(!isProd && { stack: err.stack }),
      },
    },
    status: 500,
  };
};

export { AppError, errorBody, errorSchema, resolveError };
export type { ErrorBody };
