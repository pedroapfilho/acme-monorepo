import { envAuthConfig } from "@repo/auth/env-config";
import { createAuth, prismaDatabase } from "@repo/auth/server";
import type { Auth } from "@repo/auth/server";
import { prisma } from "@repo/db";
import { createResendMailer } from "@repo/transactional";
import { nextCookies } from "better-auth/next-js";

import { getEnv } from "./env";

let cachedAuth: Auth | undefined;

const getAuth = (): Auth => {
  if (!cachedAuth) {
    const env = getEnv();
    cachedAuth = createAuth({
      ...envAuthConfig(),
      database: prismaDatabase(prisma),
      extraPlugins: [nextCookies()],
      mailer:
        env.RESEND_API_KEY === undefined
          ? undefined
          : createResendMailer({ apiKey: env.RESEND_API_KEY, from: env.FROM_EMAIL }),
      secret: env.BETTER_AUTH_SECRET,
    });
  }
  return cachedAuth;
};

export { getAuth };
