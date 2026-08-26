import type { PrismaClient } from "@repo/db";
import { log } from "@repo/observability";
import type { MailerConfig, TransactionalEmail } from "@repo/transactional";
import { sendTransactionalEmail } from "@repo/transactional";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins/bearer";
import { username } from "better-auth/plugins/username";
import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth/types";

const COOKIE_PREFIX = "acme";

type AuthConfig = {
  allowedHosts: Array<string>;
  extraPlugins?: Array<BetterAuthPlugin>;
  fromEmail: string;
  prisma: PrismaClient;
  rateLimitEnabled?: boolean;
  resendApiKey?: string;
  secret: string;
  trustedOrigins?: Array<string>;
  useSecureCookies?: boolean;
};

const createAuth = (config: AuthConfig) => {
  const {
    allowedHosts,
    extraPlugins = [],
    fromEmail,
    prisma,
    rateLimitEnabled = false,
    resendApiKey,
    secret,
    trustedOrigins = [],
    useSecureCookies = false,
  } = config;

  const mailer: MailerConfig | null =
    resendApiKey !== undefined && resendApiKey !== ""
      ? { apiKey: resendApiKey, from: fromEmail }
      : null;

  // "log" is load-bearing for onExistingUserSignUp: Better Auth runs that hook on a background path
  // where a throw escapes into the sign-up response instead of failing the send.
  const deliver = async (
    email: TransactionalEmail,
    onFailure: { message: string; mode: "log" | "throw" },
  ) => {
    if (!mailer) {
      return;
    }
    const result = await sendTransactionalEmail(email, mailer);
    if (result.ok) {
      return;
    }
    if (onFailure.mode === "throw") {
      throw new Error(`${onFailure.message}: ${result.error}`);
    }
    log.error({ error: result.error, message: onFailure.message });
  };

  const emailVerification: NonNullable<BetterAuthOptions["emailVerification"]> & {
    callbackURL: string;
  } = {
    autoSignInAfterVerification: true,
    callbackURL: "/",
    sendOnSignIn: true,
  };
  if (mailer) {
    emailVerification.sendVerificationEmail = async ({ url, user }) => {
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
    };
  }

  return betterAuth({
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

    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    emailAndPassword: {
      enabled: true,
      maxPasswordLength: 128,
      minPasswordLength: 12,
      onExistingUserSignUp: async ({ user }, request) => {
        const origin = request?.headers.get("origin") ?? "";
        await deliver(
          {
            resetPasswordUrl: `${origin}/recover`,
            signInUrl: `${origin}/login`,
            type: "sign-up-attempt",
            userEmail: user.email,
            userId: user.id,
            username: user.name,
          },
          { message: "Auth: failed to send sign-up attempt email", mode: "log" },
        );
      },
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

    emailVerification,

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
};

type Auth = ReturnType<typeof createAuth>;

export { COOKIE_PREFIX, createAuth };
export type { Auth, AuthConfig };
