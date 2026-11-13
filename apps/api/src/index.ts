import "zod/compile";
import "dotenv/config";

import { serve } from "@hono/node-server";
import { log } from "@repo/observability";
import { initApiLogger } from "@repo/observability/hono";

import { createApp } from "./app";
import { sessions } from "./lib/auth";
import { prisma } from "./lib/db";
import { env } from "./lib/env";

initApiLogger({ service: "api" });

const app = createApp({
  checkDatabase: async () => {
    await prisma.$queryRaw`SELECT 1`;
  },
  corsOrigins: env.CORS_ORIGINS,
  getSession: sessions.getSession,
  isProduction: env.NODE_ENV === "production",
  sessionCookieName: sessions.sessionCookieName,
  trustedProxyHops: env.TRUSTED_PROXY_HOPS,
});

log.info({
  cors: env.CORS_ORIGINS,
  env: env.NODE_ENV,
  hostname: env.HOST,
  message: "Starting server",
  port: env.PORT,
});

const server = serve({
  fetch: app.fetch,
  hostname: env.HOST,
  port: env.PORT,
});

const SHUTDOWN_SIGNALS = ["SIGINT", "SIGTERM"] as const;

for (const signal of SHUTDOWN_SIGNALS) {
  process.once(signal, () => {
    log.info({ message: "Shutting down gracefully", signal });
    server.close(() => {
      void (async () => {
        await prisma.$disconnect();
        process.exit(0);
      })();
    });
  });
}
