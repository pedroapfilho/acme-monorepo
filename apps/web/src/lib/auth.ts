import { envAuthConfig } from "@repo/auth/env-config";
import { createAuth, prismaDatabase } from "@repo/auth/server";
import type { Auth } from "@repo/auth/server";
import { prisma } from "@repo/db";
import { createMailer } from "@repo/transactional";
import { createTransport } from "@repo/transactional/transport";
import { nextCookies } from "better-auth/next-js";

import { getEnv } from "./env";
import { routes } from "./routes";

const emailConfig = (webAppUrl: string | undefined) => {
  const env = getEnv();

  if (webAppUrl === undefined) {
    throw new Error("WEB_APP_URL is required: auth emails link to the web app");
  }

  return {
    mailer: createMailer({
      from: env.FROM_EMAIL,
      transport: createTransport({ apiKey: env.RESEND_API_KEY, transport: env.MAIL_TRANSPORT }),
    }),
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
