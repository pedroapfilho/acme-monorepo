import { env } from "./lib/env";
import { logger } from "./lib/logger";
import { errorHandler, notFound } from "./middleware/error-handler";
import {
  securityHeaders,
  standardRateLimit,
  authRateLimit,
  apiRateLimit,
  requestSizeLimit,
  requestId,
} from "./middleware/security";
import { auth } from "./lib/auth";
import { v1UserRoutes } from "./routes/v1/users";
import { serve } from "@hono/node-server";
import { prisma } from "@repo/db";
import "dotenv/config";
import { Hono } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";

const app = new Hono();

// Global middleware
app.use("*", requestId);
app.use("*", compress());
app.use("*", requestSizeLimit());
app.use("*", securityHeaders);
app.use(
  "*",
  cors({
    origin: env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  }),
);

// Logging middleware (skip for health check)
app.use("*", async (c, next) => {
  if (c.req.path === "/healthz") {
    return next();
  }

  const start = Date.now();
  await next();
  const ms = Date.now() - start;

  logger.info({
    method: c.req.method,
    url: c.req.url,
    status: c.res.status,
    duration: ms,
  });
});

// Rate limiting
app.use("/api/*", standardRateLimit);
app.use("/auth/sign-up", authRateLimit);
app.use("/auth/sign-in/*", authRateLimit);

// Health check endpoint
app.get("/healthz", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "api",
    version: "1.0.0",
  });
});

// Readiness check endpoint
app.get("/readyz", async (c) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return c.json({
      status: "ready",
      timestamp: new Date().toISOString(),
      checks: {
        database: "healthy",
      },
    });
  } catch (error) {
    logger.error({ error }, "Readiness check failed");
    return c.json(
      {
        status: "not ready",
        timestamp: new Date().toISOString(),
        checks: {
          database: "unhealthy",
        },
      },
      503,
    );
  }
});

// Better Auth routes
app.on(["POST", "GET"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// API v1 routes
const v1 = new Hono();
v1.use("*", apiRateLimit);
v1.route("/users", v1UserRoutes);

app.route("/api/v1", v1);

// 404 handler
app.notFound(notFound);

// Global error handler
app.onError(errorHandler);

// Start server
const port = Number(env.PORT) || 4000;
const hostname = env.HOST || "0.0.0.0";

logger.info(
  {
    port,
    hostname,
    env: env.NODE_ENV,
    cors: env.CORS_ORIGINS,
  },
  "🚀 Starting server...",
);

serve({
  fetch: app.fetch,
  port,
  hostname,
});

// Graceful shutdown
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
