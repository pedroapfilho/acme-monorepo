import { envAuthConfig } from "@repo/auth/env-config";
import { createAuth, prismaDatabase } from "@repo/auth/server";
import type { Auth } from "@repo/auth/server";
import { createMailer } from "@repo/transactional";
import { createTransport } from "@repo/transactional/transport";
import { nextCookies } from "better-auth/next-js";

import { getPrisma } from "./db";
import { getEnv } from "./env";
import type { Env } from "./env";
import { routes } from "./routes";

const emailConfig = (env: Env) => {
  if (env.WEB_APP_URL === undefined) {
    throw new Error("WEB_APP_URL is required: auth emails link to the web app");
  }

  return {
    mailer: createMailer({
      from: env.FROM_EMAIL,
      transport: createTransport({ apiKey: env.RESEND_API_KEY, transport: env.MAIL_TRANSPORT }),
    }),
    resetPasswordUrl: new URL(routes.recover.path, env.WEB_APP_URL).href,
    signInUrl: new URL(routes.login.path, env.WEB_APP_URL).href,
  };
};

let cachedAuth: Auth | undefined;

const getAuth = (): Auth => {
  if (!cachedAuth) {
    const env = getEnv();

    cachedAuth = createAuth({
      ...envAuthConfig(env),
      database: prismaDatabase(getPrisma()),
      email: emailConfig(env),
      extraPlugins: [nextCookies()],
      secret: env.BETTER_AUTH_SECRET,
    });
  }

  return cachedAuth;
};

export { getAuth };
