import { honoEvlog } from "@repo/observability/hono";
import type { EvlogVariables } from "@repo/observability/hono";
import { Scalar } from "@scalar/hono-api-reference";
import { createMarkdownFromOpenApi } from "@scalar/openapi-to-markdown";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";

import { createErrorHandler, notFound } from "@/lib/api-error";
import { apiDocumentMetadata, createRouter } from "@/lib/openapi";
import { createSessionAuth } from "@/lib/session";
import type { SessionLookup } from "@/lib/session";
import type { UserStore } from "@/lib/users";
import { createRateLimit, requestSizeLimit, securityHeaders } from "@/middleware/security";
import { createHealthRoutes } from "@/routes/health";
import type { CheckDatabase } from "@/routes/health";
import { createV1UserRoutes } from "@/routes/v1/users";

declare module "hono" {
  // oxlint-disable-next-line consistent-type-definitions -- declaration merging requires interface, not type
  interface ContextVariableMap {
    log: EvlogVariables["Variables"]["log"];
    requestId: string;
  }
}

type AppDeps = {
  checkDatabase: CheckDatabase;
  corsOrigins: Array<string>;
  getSession: SessionLookup;
  isProduction: boolean;
  sessionCookieName: string;
  trustProxy: boolean;
  users: UserStore;
};

const createApp = (deps: AppDeps) => {
  const app = createRouter();
  const rateLimit = createRateLimit(deps.trustProxy);
  const authenticated = createSessionAuth(app.openAPIRegistry, {
    cookieName: deps.sessionCookieName,
    getSession: deps.getSession,
  });

  app.use(requestId());
  app.use(honoEvlog());
  app.use(compress());
  app.use(securityHeaders);
  app.use(
    cors({
      allowHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      credentials: true,
      origin: deps.corsOrigins,
    }),
  );
  app.use(requestSizeLimit);
  app.use(
    "/api/*",
    rateLimit({
      code: "RATE_LIMIT_EXCEEDED",
      limit: 100,
      message: "Too many requests, please try again later",
      windowMs: 15 * 60 * 1000,
    }),
  );
  app.use(
    "/api/v1/*",
    rateLimit({
      code: "API_RATE_LIMIT_EXCEEDED",
      limit: 30,
      message: "API rate limit exceeded, please slow down",
      windowMs: 60 * 1000,
    }),
  );

  app.route("/", createHealthRoutes(deps.checkDatabase));
  app.route("/api/v1/users", createV1UserRoutes({ authenticated, users: deps.users }));

  // 3.0.0, not 3.1.0: external generators still reject 3.1's nullable/examples encoding.
  app.doc("/openapi.json", { ...apiDocumentMetadata, openapi: "3.0.0" });
  app.get("/docs", Scalar({ url: "/openapi.json" }));

  let llmsMarkdown: Promise<string> | undefined;
  app.get("/llms.txt", async (c) => {
    llmsMarkdown ??= createMarkdownFromOpenApi(
      JSON.stringify(app.getOpenAPI31Document({ ...apiDocumentMetadata, openapi: "3.1.0" })),
    );
    return c.text(await llmsMarkdown);
  });

  app.notFound(notFound);
  app.onError(createErrorHandler(deps.isProduction));

  return app;
};

export { createApp };
export type { AppDeps };
