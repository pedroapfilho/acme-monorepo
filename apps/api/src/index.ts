import "zod/compile";
import "dotenv/config";

import { serve } from "@hono/node-server";
import { parseEnvList } from "@repo/auth/env-config";
import { prisma } from "@repo/db";
import { log } from "@repo/observability";
import { initApiLogger } from "@repo/observability/hono";
import { getCookies } from "better-auth/cookies";

import { createApp } from "./app";
import { auth } from "./lib/auth";
import { env } from "./lib/env";
import { createUserStore } from "./lib/users";

initApiLogger({ service: "api" });

const app = createApp({
  checkDatabase: async () => {
    await prisma.$queryRaw`SELECT 1`;
  },
  corsOrigins: parseEnvList(env.CORS_ORIGINS),
  getSession: auth.api.getSession,
  isProduction: env.NODE_ENV === "production",
  sessionCookieName: getCookies(auth.options).sessionToken.name,
  trustProxy: env.TRUST_PROXY,
  users: createUserStore(auth, prisma),
});

const port = Number(env.PORT);

log.info({
  cors: env.CORS_ORIGINS,
  env: env.NODE_ENV,
  hostname: env.HOST,
  message: "Starting server",
  port,
});

const server = serve({
  fetch: app.fetch,
  hostname: env.HOST,
  port,
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
