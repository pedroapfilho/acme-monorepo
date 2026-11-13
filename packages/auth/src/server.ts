import type { PrismaClient } from "@repo/db";
import { slug } from "@repo/identity";
import { log } from "@repo/observability";
import { loopbackUrl } from "@repo/portless-env/apps";
import type { Mailer, TransactionalEmail } from "@repo/transactional";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { getCookies } from "better-auth/cookies";
import { bearer } from "better-auth/plugins/bearer";
import type { BetterAuthPlugin, DBAdapterInstance } from "better-auth/types";

import { name, PASSWORD_LENGTH } from "./policy";

const EMAIL_LINK_LIFETIME_HOURS = 1;

type EmailConfig = {
  mailer: Mailer;
  resetPasswordUrl: string;
  signInUrl: string;
};

type AuthConfig = {
  allowedHosts: Array<string>;
  database: DBAdapterInstance;
  email?: EmailConfig;
  extraPlugins?: Array<BetterAuthPlugin>;
  rateLimitEnabled?: boolean;
  secret: string;
  trustedOrigins?: Array<string>;
  useSecureCookies?: boolean;
  webAppUrl?: string;
};

// Better Auth accepts any string as a name.
const assertName = (value: string | undefined) => {
  const issue = value === undefined ? undefined : name.safeParse(value).error?.issues[0];

  if (issue) {
    throw new APIError("BAD_REQUEST", { message: issue.message });
  }
};

const prismaDatabase = (prisma: PrismaClient) => prismaAdapter(prisma, { provider: "postgresql" });

const createAuth = (config: AuthConfig) => {
  const {
    allowedHosts,
    database,
    email,
    extraPlugins = [],
    rateLimitEnabled = false,
    secret,
    trustedOrigins = [],
    useSecureCookies = false,
    webAppUrl,
  } = config;

  const mailer = email?.mailer;

  const deliver = async (
    mail: TransactionalEmail,
    onFailure: { message: string; mode: "log" | "throw" },
  ) => {
    if (!mailer) {
      return;
    }

    const result = await mailer(mail);

    if (result.ok) {
      return;
    }

    if (onFailure.mode === "throw") {
      throw new Error(`${onFailure.message}: ${result.error}`);
    }

    log.error({ error: result.error, message: onFailure.message });
  };

  const auth = betterAuth({
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["email"],
      },
    },

    advanced: {
      cookiePrefix: slug,
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax" as const,
      },
      useSecureCookies,
    },

    basePath: "/api/auth",

    baseURL: {
      allowedHosts,
      fallback: webAppUrl ?? loopbackUrl("web", "localhost"),
      protocol: "auto",
    },

    database,

    databaseHooks: {
      user: {
        create: {
          before: (user) => {
            assertName(user.name);

            return Promise.resolve();
          },
        },
        update: {
          before: (user) => {
            assertName(user.name);

            return Promise.resolve();
          },
        },
      },
    },

    emailAndPassword: {
      enabled: true,
      maxPasswordLength: PASSWORD_LENGTH.max,
      minPasswordLength: PASSWORD_LENGTH.min,
      // A failed notice must not fail the sign-up: the generic response is what hides that the email is registered.
      onExistingUserSignUp:
        email &&
        (async ({ user }) => {
          await deliver(
            {
              name: user.name,
              resetPasswordUrl: email.resetPasswordUrl,
              signInUrl: email.signInUrl,
              type: "sign-up-attempt",
              userEmail: user.email,
              userId: user.id,
            },
            { message: "Auth: failed to send sign-up attempt email", mode: "log" },
          );
        }),
      requireEmailVerification: Boolean(mailer),
      resetPasswordTokenExpiresIn: EMAIL_LINK_LIFETIME_HOURS * 60 * 60,
      sendResetPassword: async ({ url, user }) => {
        await deliver(
          {
            linkLifetimeHours: EMAIL_LINK_LIFETIME_HOURS,
            name: user.name,
            resetUrl: url,
            type: "password-reset",
            userEmail: user.email,
            userId: user.id,
          },
          { message: "Failed to send password reset email", mode: "throw" },
        );
      },
    },

    emailVerification: {
      autoSignInAfterVerification: true,
      expiresIn: EMAIL_LINK_LIFETIME_HOURS * 60 * 60,
      sendOnSignIn: true,
      sendVerificationEmail:
        mailer &&
        (async ({ url, user }) => {
          await deliver(
            {
              linkLifetimeHours: EMAIL_LINK_LIFETIME_HOURS,
              name: user.name,
              type: "welcome",
              userEmail: user.email,
              userId: user.id,
              verificationUrl: url,
            },
            { message: "Failed to send verification email", mode: "throw" },
          );
        }),
    },

    plugins: [bearer(), ...extraPlugins],

    rateLimit: {
      enabled: rateLimitEnabled,
      max: 100,
      storage: "database",
      window: 60,
    },

    secret,

    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
      expiresIn: 60 * 60 * 24 * 7,
      storeSessionInDatabase: true,
      updateAge: 60 * 60 * 24,
    },
    trustedOrigins,
    user: {
      changeEmail: {
        enabled: true,
        sendChangeEmailConfirmation: async ({ newEmail, url, user }) => {
          await deliver(
            {
              changeUrl: url,
              currentEmail: user.email,
              linkLifetimeHours: EMAIL_LINK_LIFETIME_HOURS,
              name: user.name,
              newEmail,
              type: "change-email-confirmation",
              userId: user.id,
            },
            { message: "Failed to send change-email confirmation", mode: "throw" },
          );
        },
      },
      deleteUser: {
        enabled: true,
      },
    },
  });

  return {
    ...auth,
    canSendEmail: mailer !== undefined,
    sessionCookieName: getCookies(auth.options).sessionToken.name,
  };
};

type Auth = ReturnType<typeof createAuth>;

export { createAuth, prismaDatabase };

export type { Auth, AuthConfig };
