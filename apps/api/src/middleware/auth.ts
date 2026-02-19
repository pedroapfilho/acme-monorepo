import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { auth } from "../lib/auth";

type AuthVariables = {
  user: {
    displayName?: string;
    email: string;
    id: string;
    username?: string;
  };
};

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c: Context, next: Next) => {
    const headers = new Headers();

    // Extract auth headers
    const authHeader = c.req.header("Authorization");
    if (authHeader) {
      headers.set("Authorization", authHeader);
    }

    const cookie = c.req.header("Cookie");
    if (cookie) {
      headers.set("Cookie", cookie);
    }

    // Use Better Auth's session handling
    const session = await auth.api.getSession({ headers });

    if (!session || !session.user) {
      throw new HTTPException(401, {
        message: "Authentication required",
      });
    }

    // Set user in Hono context
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
  const headers = new Headers();

  // Extract auth headers
  const authHeader = c.req.header("Authorization");
  if (authHeader) {
    headers.set("Authorization", authHeader);
  }

  const cookie = c.req.header("Cookie");
  if (cookie) {
    headers.set("Cookie", cookie);
  }

  try {
    // Use Better Auth's session handling
    const session = await auth.api.getSession({ headers });

    if (session && session.user) {
      // Set user in Hono context
      c.set("user", {
        displayName: session.user.displayName,
        email: session.user.email,
        id: session.user.id,
        username: session.user.username,
      });
    }
  } catch {
    // Ignore errors for optional auth
  }

  await next();
});
