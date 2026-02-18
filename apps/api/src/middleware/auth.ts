import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { auth } from "../lib/auth";

type AuthVariables = {
  user: {
    id: string;
    email: string;
    username?: string;
    displayName?: string;
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
      id: session.user.id,
      email: session.user.email,
      username: session.user.username,
      displayName: session.user.displayName,
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
        id: session.user.id,
        email: session.user.email,
        username: session.user.username,
        displayName: session.user.displayName,
      });
    }
  } catch (error) {
    // Ignore errors for optional auth
    console.error("Optional auth error:", error);
  }

  await next();
});
