import { envAuthConfig } from "@repo/auth/env-config";
import { createAuth, prismaDatabase } from "@repo/auth/server";
import type { Auth } from "@repo/auth/server";
import { prisma } from "@repo/db";
import { createResendMailer } from "@repo/transactional";
import { nextCookies } from "better-auth/next-js";

import { getEnv } from "./env";
import { routes } from "./routes";

const emailConfig = (webAppUrl: string | undefined) => {
  const env = getEnv();

  if (env.RESEND_API_KEY === undefined) {
    return undefined;
  }

  if (webAppUrl === undefined) {
    throw new Error("WEB_APP_URL is required with RESEND_API_KEY: auth emails link to the web app");
  }

  return {
    mailer: createResendMailer({ apiKey: env.RESEND_API_KEY, from: env.FROM_EMAIL }),
    resetPasswordUrl: new URL(routes.recover.path, webAppUrl).href,
    signInUrl: new URL(routes.login.path, webAppUrl).href,
  };
};

let cachedAuth: Auth | undefined;

const getAuth = (): Auth => {
  if (!cachedAuth) {
    const config = envAuthConfig();

    cachedAuth = createAuth({
      ...config,
      database: prismaDatabase(prisma),
      email: emailConfig(config.webAppUrl),
      extraPlugins: [nextCookies()],
      secret: getEnv().BETTER_AUTH_SECRET,
    });
  }

  return cachedAuth;
};

export { getAuth };
