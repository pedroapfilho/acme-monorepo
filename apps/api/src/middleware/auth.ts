import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

type AuthVariables = {
  user: {
    email: string;
    id: string;
  };
};

type GetSession = (input: { headers: Headers }) => Promise<{
  user?: {
    email: string;
    id: string;
  } | null;
} | null>;

const createAuthMiddleware = (getSession: GetSession) =>
  createMiddleware<{ Variables: AuthVariables }>(async (c: Context, next: Next) => {
    let session;
    try {
      session = await getSession({ headers: c.req.raw.headers });
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
      throw new HTTPException(401, { message: "Authentication required" });
    }

    c.set("user", { email: user.email, id: user.id });
    return next();
  });

export { createAuthMiddleware };
export type { AuthVariables, GetSession };
