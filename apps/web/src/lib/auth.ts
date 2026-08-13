import { envAuthConfig } from "@repo/auth/env-config";
import { createAuth } from "@repo/auth/server";
import { prisma } from "@repo/db";
import { nextCookies } from "better-auth/next-js";

import { getEnv } from "./env";

type Auth = ReturnType<typeof createAuth>;
let cachedAuth: Auth | undefined;

const getAuth = (): Auth => {
  if (!cachedAuth) {
    const env = getEnv();
    cachedAuth = createAuth({
      ...envAuthConfig(),
      extraPlugins: [nextCookies()],
      fromEmail: env.FROM_EMAIL,
      prisma,
      resendApiKey: env.RESEND_API_KEY,
      secret: env.BETTER_AUTH_SECRET,
    });
  }
  return cachedAuth;
};

export { getAuth };
