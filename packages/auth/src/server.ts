import type { PrismaClient } from "@repo/db";
import { log } from "@repo/observability";
import { loopbackUrl } from "@repo/portless-env/apps";
import type { Mailer, TransactionalEmail } from "@repo/transactional";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { getCookies } from "better-auth/cookies";
import { bearer } from "better-auth/plugins/bearer";
import type { BetterAuthOptions, BetterAuthPlugin, DBAdapterInstance } from "better-auth/types";

import { name, PASSWORD_LENGTH } from "./policy";

const COOKIE_PREFIX = "acme";

const EMAIL_LINK_LIFETIME_HOURS = 1;

type EmailConfig = {
  mailer: Mailer;
  resetPasswordUrl: string;
  signInUrl: string;
};

type SessionConfig = {
  allowedHosts: Array<string>;
  database: DBAdapterInstance;
  extraPlugins?: Array<BetterAuthPlugin>;
  rateLimitEnabled?: boolean;
  secret: string;
  trustedOrigins?: Array<string>;
  useSecureCookies?: boolean;
  webAppUrl?: string;
};

type AuthConfig = SessionConfig & { email: EmailConfig };

// Better Auth accepts any string as a name.
const assertName = (value: string | undefined) => {
  const issue = value === undefined ? undefined : name.safeParse(value).error?.issues[0];

  if (issue) {
    throw new APIError("BAD_REQUEST", { message: issue.message });
  }
};

const prismaDatabase = (prisma: PrismaClient) => prismaAdapter(prisma, { provider: "postgresql" });

const sessionOptions = ({
  allowedHosts,
  database,
  extraPlugins = [],
  rateLimitEnabled = false,
  secret,
  trustedOrigins = [],
  useSecureCookies = false,
  webAppUrl,
}: SessionConfig) =>
  ({
    advanced: {
      cookiePrefix: COOKIE_PREFIX,
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
  }) satisfies BetterAuthOptions;

const createSessionReader = (config: SessionConfig) => {
  const auth = betterAuth(sessionOptions(config));

  return {
    getSession: auth.api.getSession,
    sessionCookieName: getCookies(auth.options).sessionToken.name,
  };
};

const createAuth = ({ email, ...config }: AuthConfig) => {
  const deliver = async (mail: TransactionalEmail, failure: string) => {
    const result = await email.mailer(mail);

    if (!result.ok) {
      throw new Error(`${failure}: ${result.error}`);
    }
  };

  const auth = betterAuth({
    ...sessionOptions(config),

    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["email"],
      },
    },

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
      onExistingUserSignUp: async ({ user }) => {
        const result = await email.mailer({
          name: user.name,
          resetPasswordUrl: email.resetPasswordUrl,
          signInUrl: email.signInUrl,
          type: "sign-up-attempt",
          userEmail: user.email,
          userId: user.id,
        });

        if (!result.ok) {
          log.error({ error: result.error, message: "Auth: failed to send sign-up attempt email" });
        }
      },
      requireEmailVerification: true,
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
          "Failed to send password reset email",
        );
      },
    },

    emailVerification: {
      autoSignInAfterVerification: true,
      expiresIn: EMAIL_LINK_LIFETIME_HOURS * 60 * 60,
      sendOnSignIn: true,
      sendVerificationEmail: async ({ url, user }) => {
        await deliver(
          {
            linkLifetimeHours: EMAIL_LINK_LIFETIME_HOURS,
            name: user.name,
            type: "welcome",
            userEmail: user.email,
            userId: user.id,
            verificationUrl: url,
          },
          "Failed to send verification email",
        );
      },
    },

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
            "Failed to send change-email confirmation",
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
    sessionCookieName: getCookies(auth.options).sessionToken.name,
  };
};

type Auth = ReturnType<typeof createAuth>;

export { createAuth, createSessionReader, prismaDatabase };

export type { Auth, AuthConfig };
