import "dotenv/config";

import { serve } from "@hono/node-server";
import { parseEnvList } from "@repo/auth/env-config";
import { prisma } from "@repo/db";
import { createIdentify } from "@repo/observability/auth";
import { honoEvlog, initApiLogger, log } from "@repo/observability/hono";
import { createMarkdownFromOpenApi } from "@scalar/openapi-to-markdown";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";

import { auth } from "./lib/auth";
import { env } from "./lib/env";
import { apiDocumentMetadata, createOpenAPIApp } from "./lib/openapi";
import { createUserService } from "./lib/users";
import { createAuthMiddleware } from "./middleware/auth";
import { createErrorHandler, notFound } from "./middleware/error-handler";
import {
  apiRateLimit,
  requestSizeLimit,
  securityHeaders,
  standardRateLimit,
} from "./middleware/security";
import { createHealthRoutes } from "./routes/health";
import { createV1UserRoutes } from "./routes/v1/users";

initApiLogger({ service: "api" });

const app = createOpenAPIApp();

const identify = createIdentify(auth);
const authMiddleware = createAuthMiddleware(auth.api.getSession);
const healthRoutes = createHealthRoutes(async () => {
  await prisma.$queryRaw`SELECT 1`;
});
const userService = createUserService({
  delete: async (input) => {
    await prisma.user.delete(input);
  },
  findUnique: (input) => prisma.user.findUnique(input),
  update: (input) => prisma.user.update(input),
});
const v1UserRoutes = createV1UserRoutes({ authMiddleware, ...userService });
const errorHandler = createErrorHandler(env.NODE_ENV === "production");

app.use("*", requestId());
app.use("*", honoEvlog());
app.use("*", async (c, next) => {
  await identify(c.get("log"), c.req.raw.headers, c.req.path);
  return next();
});
app.use("*", compress());
app.use("*", requestSizeLimit());
app.use("*", securityHeaders);
app.use(
  "*",
  cors({
    allowHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
    origin: parseEnvList(env.CORS_ORIGINS),
  }),
);

app.use("/api/*", standardRateLimit);
app.use("/api/v1/*", apiRateLimit);

app.route("/", healthRoutes);
app.route("/api/v1/users", v1UserRoutes);

const openApiContent = app.getOpenAPI31Document({
  ...apiDocumentMetadata,
  openapi: "3.1.0",
});

const llmsMarkdown = await createMarkdownFromOpenApi(JSON.stringify(openApiContent));

app.get("/llms.txt", (c) => c.text(llmsMarkdown));

app.notFound(notFound);

app.onError(errorHandler);

const port = Number(env.PORT) || 4000;
const hostname = env.HOST || "0.0.0.0";

log.info({
  cors: env.CORS_ORIGINS,
  env: env.NODE_ENV,
  hostname,
  message: "Starting server",
  port,
});

serve({
  fetch: app.fetch,
  hostname,
  port,
});

const SHUTDOWN_SIGNALS = ["SIGINT", "SIGTERM"] as const;

for (const signal of SHUTDOWN_SIGNALS) {
  process.on(signal, () => {
    void (async () => {
      log.info({ message: "Shutting down gracefully", signal });
      await prisma.$disconnect();
      process.exit(0);
    })();
  });
}
