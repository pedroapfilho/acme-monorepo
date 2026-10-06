import type { PrismaClient } from "@repo/db";
import { log } from "@repo/observability";
import type { Mailer, TransactionalEmail } from "@repo/transactional";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins/bearer";
import { username } from "better-auth/plugins/username";
import type { BetterAuthPlugin, DBAdapterInstance } from "better-auth/types";

const COOKIE_PREFIX = "acme";

type AuthConfig = {
  allowedHosts: Array<string>;
  database: DBAdapterInstance;
  extraPlugins?: Array<BetterAuthPlugin>;
  mailer?: Mailer;
  rateLimitEnabled?: boolean;
  secret: string;
  trustedOrigins?: Array<string>;
  useSecureCookies?: boolean;
  webAppUrl?: string;
};

const prismaDatabase = (prisma: PrismaClient) => prismaAdapter(prisma, { provider: "postgresql" });

const signUpAttemptLinks = (webAppUrl: string | undefined) => {
  if (webAppUrl === undefined) {
    throw new Error("createAuth: a mailer needs webAppUrl to link emails back to the web app");
  }
  return {
    resetPasswordUrl: new URL("/recover", webAppUrl).href,
    signInUrl: new URL("/login", webAppUrl).href,
  };
};

const createAuth = (config: AuthConfig) => {
  const {
    allowedHosts,
    database,
    extraPlugins = [],
    mailer,
    rateLimitEnabled = false,
    secret,
    trustedOrigins = [],
    useSecureCookies = false,
    webAppUrl,
  } = config;

  const links = mailer && signUpAttemptLinks(webAppUrl);

  const deliver = async (
    email: TransactionalEmail,
    onFailure: { message: string; mode: "log" | "throw" },
  ) => {
    if (!mailer) {
      return;
    }
    const result = await mailer(email);
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
      fallback: "http://localhost:4000",
      protocol: "auto",
    },

    database,

    emailAndPassword: {
      enabled: true,
      maxPasswordLength: 128,
      minPasswordLength: 12,
      // A failed notice must not fail the sign-up: the generic response is what hides that the email is registered.
      onExistingUserSignUp:
        links &&
        (async ({ user }) => {
          await deliver(
            {
              ...links,
              type: "sign-up-attempt",
              userEmail: user.email,
              userId: user.id,
              username: user.name,
            },
            { message: "Auth: failed to send sign-up attempt email", mode: "log" },
          );
        }),
      requireEmailVerification: Boolean(mailer),
      sendResetPassword: async ({ url, user }) => {
        await deliver(
          {
            resetUrl: url,
            type: "password-reset",
            userEmail: user.email,
            userId: user.id,
            username: user.name,
          },
          { message: "Failed to send password reset email", mode: "throw" },
        );
      },
    },

    emailVerification: {
      autoSignInAfterVerification: true,
      sendOnSignIn: true,
      sendVerificationEmail:
        mailer &&
        (async ({ url, user }) => {
          await deliver(
            {
              type: "welcome",
              userEmail: user.email,
              userId: user.id,
              username: user.name,
              verificationUrl: url,
            },
            { message: "Failed to send verification email", mode: "throw" },
          );
        }),
    },

    plugins: [username(), bearer(), ...extraPlugins],

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
      additionalFields: {
        displayName: {
          defaultValue: null,
          required: false,
          type: "string",
        },
      },
      changeEmail: {
        enabled: true,
        sendChangeEmailConfirmation: async ({ newEmail, url, user }) => {
          await deliver(
            {
              changeUrl: url,
              currentEmail: user.email,
              newEmail,
              type: "change-email-confirmation",
              userId: user.id,
              username: user.name,
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

  return { ...auth, canSendEmail: mailer !== undefined };
};

type Auth = ReturnType<typeof createAuth>;

export { COOKIE_PREFIX, createAuth, prismaDatabase };
export type { Auth, AuthConfig };
