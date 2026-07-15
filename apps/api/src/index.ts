import "dotenv/config";

import { serve } from "@hono/node-server";
import { createRoute, z } from "@hono/zod-openapi";
import { prisma } from "@repo/db";
import { createIdentify } from "@repo/observability/auth";
import { honoEvlog, initApiLogger, log } from "@repo/observability/hono";
import { createMarkdownFromOpenApi } from "@scalar/openapi-to-markdown";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";

import { auth } from "./lib/auth";
import { env } from "./lib/env";
import { createOpenAPIApp } from "./lib/openapi";
import { errorHandler, notFound } from "./middleware/error-handler";
import {
  apiRateLimit,
  requestSizeLimit,
  securityHeaders,
  standardRateLimit,
} from "./middleware/security";
import { v1UserRoutes } from "./routes/v1/users";

initApiLogger({ service: "api" });

const app = createOpenAPIApp();

const identify = createIdentify(auth);

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
    origin: env.CORS_ORIGINS.split(","),
  }),
);

app.use("/api/*", standardRateLimit);
app.use("/api/v1/*", apiRateLimit);

const healthRoute = createRoute({
  description: "Liveness probe; does not touch the database.",
  method: "get",
  path: "/healthz",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            service: z.string(),
            status: z.literal("healthy"),
            timestamp: z.iso.datetime(),
            version: z.string(),
          }),
        },
      },
      description: "API is healthy",
    },
  },
  summary: "Liveness check",
  tags: ["System"],
});

app.openapi(healthRoute, (c) =>
  c.json(
    {
      service: "api",
      status: "healthy" as const,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
    200,
  ),
);

const readyzResponseSchema = z.object({
  checks: z.object({ database: z.enum(["healthy", "unhealthy"]) }),
  status: z.enum(["ready", "not ready"]),
  timestamp: z.iso.datetime(),
});

const readyzRoute = createRoute({
  description: "Readiness probe; verifies the database is reachable.",
  method: "get",
  path: "/readyz",
  responses: {
    200: {
      content: { "application/json": { schema: readyzResponseSchema } },
      description: "API is ready to serve traffic",
    },
    503: {
      content: { "application/json": { schema: readyzResponseSchema } },
      description: "API is not ready (e.g. database unreachable)",
    },
  },
  summary: "Readiness check",
  tags: ["System"],
});

app.openapi(readyzRoute, async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return c.json(
      {
        checks: { database: "healthy" as const },
        status: "ready" as const,
        timestamp: new Date().toISOString(),
      },
      200,
    );
  } catch (error) {
    c.get("log").error("Readiness check failed", { error });
    return c.json(
      {
        checks: { database: "unhealthy" as const },
        status: "not ready" as const,
        timestamp: new Date().toISOString(),
      },
      503,
    );
  }
});

app.route("/api/v1/users", v1UserRoutes);

const openApiContent = app.getOpenAPI31Document({
  info: { title: "Acme API", version: "v1" },
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

process.on("SIGTERM", async () => {
  log.info("server", "SIGTERM received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  log.info("server", "SIGINT received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});
