import type { Context } from "hono";

import { errorBody, resolveError } from "@/lib/api-error";
import { env } from "@/lib/env";

const errorHandler = (err: Error, c: Context) => {
  const forwardedFor = c.req.header("x-forwarded-for");
  c.get("log").error(err, {
    ip:
      forwardedFor !== undefined && forwardedFor !== "" ? forwardedFor : c.req.header("x-real-ip"),
    method: c.req.method,
    url: c.req.url,
    userAgent: c.req.header("user-agent"),
  });

  const { body, status } = resolveError(err, env.NODE_ENV === "production");

  return c.json(body, status);
};

const notFound = (c: Context) => {
  return c.json(errorBody("NOT_FOUND", "Resource not found"), 404 as const);
};

export { errorHandler, notFound };
