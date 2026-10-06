import { z } from "@hono/zod-openapi";
import type { Prisma } from "@repo/db";
import { isAPIError } from "better-auth/api";
import type { ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type {
  ClientErrorStatusCode,
  ContentfulStatusCode,
  ServerErrorStatusCode,
} from "hono/utils/http-status";
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
  public readonly status: ContentfulStatusCode;

  constructor(
    message: string,
    code: string,
    status: ContentfulStatusCode = 500,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.code = code;
    this.status = status;
  }
}

const errorResponse = (description: string) => ({
  content: { "application/json": { schema: errorSchema } },
  description,
});

const errorBody = (code: string, message: string): ErrorBody => ({ error: { code, message } });

const isPrismaKnownError = (
  err: Error,
): err is InstanceType<typeof Prisma.PrismaClientKnownRequestError> =>
  "code" in err && "clientVersion" in err;

type KnownError = { code: string; message: string; status: ContentfulStatusCode };

const isErrorStatus = (status: number): status is ClientErrorStatusCode | ServerErrorStatusCode =>
  status >= 400 && status < 600;

const PRISMA_ERRORS = new Map<string, KnownError>([
  [
    "P2002",
    { code: "DUPLICATE_ENTRY", message: "A record with this value already exists", status: 409 },
  ],
  ["P2025", { code: "NOT_FOUND", message: "Record not found", status: 404 }],
]);

const toKnownError = (err: Error): KnownError | undefined => {
  if (err instanceof AppError) {
    return err;
  }

  if (err instanceof HTTPException) {
    return {
      code: err.status === 400 ? "VALIDATION_ERROR" : "HTTP_EXCEPTION",
      message: err.message,
      status: err.status,
    };
  }

  if (isAPIError(err)) {
    return {
      code: err.body?.code ?? String(err.status),
      message: err.body?.message ?? err.message,
      status: isErrorStatus(err.statusCode) ? err.statusCode : 500,
    };
  }

  if (isPrismaKnownError(err)) {
    return PRISMA_ERRORS.get(err.code);
  }

  return undefined;
};

type ResolvedError = { body: ErrorBody; status: ContentfulStatusCode };

const resolveError = (err: Error, isProduction: boolean): ResolvedError => {
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

  const known = toKnownError(err);
  if (known) {
    return { body: errorBody(known.code, known.message), status: known.status };
  }

  return {
    body: {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: isProduction ? "An unexpected error occurred" : err.message,
        ...(!isProduction && { stack: err.stack }),
      },
    },
    status: 500,
  };
};

const createErrorHandler =
  (isProduction: boolean): ErrorHandler =>
  (err, c) => {
    const { body, status } = resolveError(err, isProduction);
    return c.json(body, status);
  };

const notFound: NotFoundHandler = (c) => c.json(errorBody("NOT_FOUND", "Resource not found"), 404);

export { AppError, createErrorHandler, errorResponse, notFound };
