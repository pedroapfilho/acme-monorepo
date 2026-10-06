import type { OpenAPIHono, RouteConfig } from "@hono/zod-openapi";
import { createIdentify } from "@repo/observability/auth";
import type { ResolvedSession } from "@repo/observability/auth";
import { createMiddleware } from "hono/factory";

import { AppError, errorResponse } from "@/lib/api-error";

type Session = ResolvedSession & {
  user: { email: string; id: string };
};

type SessionLookup = (input: { headers: Headers }) => Promise<Session | null>;

type SessionUser = { email: string; id: string };

const identify = createIdentify();

const SESSION_SECURITY: Array<Record<string, Array<string>>> = [
  { bearerAuth: [] },
  { sessionCookie: [] },
];

type SessionAuthOptions = {
  cookieName: string;
  getSession: SessionLookup;
};

const createSessionAuth = (
  registry: OpenAPIHono["openAPIRegistry"],
  { cookieName, getSession }: SessionAuthOptions,
) => {
  registry.registerComponent("securitySchemes", "bearerAuth", { scheme: "bearer", type: "http" });
  registry.registerComponent("securitySchemes", "sessionCookie", {
    in: "cookie",
    name: cookieName,
    type: "apiKey",
  });

  const requireSession = createMiddleware<{ Variables: { user: SessionUser } }>(async (c, next) => {
    let session: Session | null;
    try {
      session = await getSession({ headers: c.req.raw.headers });
    } catch (error) {
      throw new AppError("Authentication service unavailable", "AUTH_UNAVAILABLE", 503, {
        cause: error,
      });
    }

    if (!session) {
      throw new AppError("Authentication required", "UNAUTHENTICATED", 401);
    }

    identify(c.get("log"), session);
    c.set("user", { email: session.user.email, id: session.user.id });
    return next();
  });

  return <R extends Omit<RouteConfig, "middleware" | "security">>(route: R) => ({
    ...route,
    middleware: requireSession,
    responses: {
      ...route.responses,
      401: errorResponse("Missing or invalid session"),
      503: errorResponse("Session lookup unavailable"),
    },
    security: SESSION_SECURITY,
  });
};

type Authenticated = ReturnType<typeof createSessionAuth>;

export { createSessionAuth };
export type { Authenticated, SessionLookup };
