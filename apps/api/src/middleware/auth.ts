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

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c: Context, next: Next) => {
    let session;
    try {
      session = await auth.api.getSession({ headers: c.req.raw.headers });
    } catch (error) {
      c.get("log").error("authMiddleware: getSession threw; auth service unavailable", {
        error,
        method: c.req.method,
        url: c.req.url,
      });
      throw new HTTPException(503, { message: "Authentication service unavailable" });
    }

    const user = session?.user;
    if (user === undefined || user === null) {
      throw new HTTPException(401, {
        message: "Authentication required",
      });
    }

    c.set("user", {
      email: user.email,
      id: user.id,
    });

    return next();
  },
);
