import type { Context } from "hono";

import { errorBody, resolveError } from "@/lib/api-error";
import { getClientIp } from "@/middleware/security";

const createErrorHandler = (isProduction: boolean) => (err: Error, c: Context) => {
  c.get("log").error(err, {
    ip: getClientIp(c),
    method: c.req.method,
    url: c.req.url,
    userAgent: c.req.header("user-agent"),
  });

  const { body, status } = resolveError(err, isProduction);

  return c.json(body, status);
};

const notFound = (c: Context) => {
  return c.json(errorBody("NOT_FOUND", "Resource not found"), 404 as const);
};

export { createErrorHandler, notFound };
