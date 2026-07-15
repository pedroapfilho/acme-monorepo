import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { auth } from "../lib/auth";

export type AuthVariables = {
  user: {
    email: string;
    id: string;
  };
};

const extractAuthHeaders = (c: Context): Headers => {
  const headers = new Headers();

  const authHeader = c.req.header("Authorization");
  if (authHeader) {
    headers.set("Authorization", authHeader);
  }

  const cookie = c.req.header("Cookie");
  if (cookie) {
    headers.set("Cookie", cookie);
  }

  return headers;
};

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c: Context, next: Next) => {
    const headers = extractAuthHeaders(c);

    let session;
    try {
      session = await auth.api.getSession({ headers });
    } catch (error) {
      c.get("log").error("authMiddleware: getSession threw; auth service unavailable", {
        error,
        method: c.req.method,
        url: c.req.url,
      });
      throw new HTTPException(503, { message: "Authentication service unavailable" });
    }

    if (!session || !session.user) {
      throw new HTTPException(401, {
        message: "Authentication required",
      });
    }

    c.set("user", {
      email: session.user.email,
      id: session.user.id,
    });

    return next();
  },
);

export const optionalAuthMiddleware = createMiddleware<{
  Variables: Partial<AuthVariables>;
}>(async (c: Context, next: Next) => {
  const headers = extractAuthHeaders(c);

  try {
    const session = await auth.api.getSession({ headers });

    if (session && session.user) {
      c.set("user", {
        email: session.user.email,
        id: session.user.id,
      });
    }
  } catch (error) {
    // Log unexpected failures; a missing user context is otherwise indistinguishable from an outage.
    c.get("log").error("optionalAuthMiddleware: getSession threw unexpectedly", {
      error,
      method: c.req.method,
      url: c.req.url,
    });
  }

  return next();
});
