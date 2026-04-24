import "dotenv/config";

import { serve } from "@hono/node-server";
import { prisma } from "@repo/db";
import { Hono } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";

import { env } from "./lib/env";
import { logger } from "./lib/logger";
import { errorHandler, notFound } from "./middleware/error-handler";
import {
  securityHeaders,
  standardRateLimit,
  apiRateLimit,
  requestSizeLimit,
  requestId,
} from "./middleware/security";
import { v1UserRoutes } from "./routes/v1/users";

const app = new Hono();

app.use("*", requestId);
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

// Skip logging for health checks
app.use("*", async (c, next) => {
  if (c.req.path === "/healthz") {
    return next();
  }

  const start = Date.now();
  await next();
  const ms = Date.now() - start;

  logger.info({
    duration: ms,
    method: c.req.method,
    status: c.res.status,
    url: c.req.url,
  });
});

app.use("/api/*", standardRateLimit);

app.get("/healthz", (c) => {
  return c.json({
    service: "api",
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.get("/readyz", async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return c.json({
      checks: {
        database: "healthy",
      },
      status: "ready",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error }, "Readiness check failed");
    return c.json(
      {
        checks: {
          database: "unhealthy",
        },
        status: "not ready",
        timestamp: new Date().toISOString(),
      },
      503,
    );
  }
});

const v1 = new Hono();
v1.use("*", apiRateLimit);
v1.route("/users", v1UserRoutes);

app.route("/api/v1", v1);

app.notFound(notFound);

app.onError(errorHandler);

const port = Number(env.PORT) || 4000;
const hostname = env.HOST || "0.0.0.0";

logger.info(
  {
    cors: env.CORS_ORIGINS,
    env: env.NODE_ENV,
    hostname,
    port,
  },
  "🚀 Starting server...",
);

serve({
  fetch: app.fetch,
  hostname,
  port,
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
