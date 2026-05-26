import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { auth } from "../lib/auth";

export type AuthVariables = {
  user: {
    displayName?: string;
    email: string;
    id: string;
    username?: string;
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
      c.var.logger.error(
        { error, method: c.req.method, url: c.req.url },
        "authMiddleware: getSession threw — auth service unavailable",
      );
      throw new HTTPException(503, { message: "Authentication service unavailable" });
    }

    if (!session || !session.user) {
      throw new HTTPException(401, {
        message: "Authentication required",
      });
    }

    c.set("user", {
      displayName: session.user.displayName,
      email: session.user.email,
      id: session.user.id,
      username: session.user.username,
    });

    await next();
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
        displayName: session.user.displayName,
        email: session.user.email,
        id: session.user.id,
        username: session.user.username,
      });
    }
  } catch (error) {
    // Log unexpected failures; a missing user context is otherwise indistinguishable from an outage.
    c.var.logger.error(
      { error, method: c.req.method, url: c.req.url },
      "optionalAuthMiddleware: getSession threw unexpectedly",
    );
  }

  await next();
});
