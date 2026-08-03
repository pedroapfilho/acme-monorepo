import type { PrismaClient } from "@repo/db";
import { log } from "@repo/observability";
import type { MailerConfig, TransactionalEmail } from "@repo/transactional";
import { sendTransactionalEmail } from "@repo/transactional";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins/bearer";
import { username } from "better-auth/plugins/username";
import type { BetterAuthPlugin } from "better-auth/types";

type AuthConfig = {
  // Better Auth rejects an empty list, so the host patterns have to come from the caller.
  allowedHosts: Array<string>;
  extraPlugins?: Array<BetterAuthPlugin>;
  fromEmail?: string;
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
    fromEmail = "noreply@acme.com",
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

  // Shared by the throwing mail callbacks only; onExistingUserSignUp must swallow
  // failures (enumeration prevention), so it stays separate.
  const deliver = async (email: TransactionalEmail, failureMessage: string) => {
    if (!mailer) {
      return;
    }
    const result = await sendTransactionalEmail(email, mailer);
    if (!result.success) {
      throw new Error(`${failureMessage}: ${result.error}`);
    }
  };

  return betterAuth({
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["email"],
      },
    },

    advanced: {
      cookiePrefix: "acme",
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax" as const,
      },
      useSecureCookies,
    },

    basePath: "/api/auth",

    // allowedHosts extends trustedOrigins; it matches on host, so it covers ports and
    // wildcards that an origin list can't.
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
      // Notify real account holder on duplicate signup (enumeration-prevention swallows it).
      onExistingUserSignUp: mailer
        ? async ({ user }, request) => {
            const origin = request?.headers.get("origin") ?? "";
            const result = await sendTransactionalEmail(
              {
                resetPasswordUrl: `${origin}/recover`,
                signInUrl: `${origin}/login`,
                type: "sign-up-attempt",
                userEmail: user.email,
                userId: user.id,
                username: user.name,
              },
              mailer,
            );
            if (!result.success) {
              // Don't throw: enumeration-prevention must return success regardless.
              log.error({
                error: result.error,
                message: "Auth: failed to send sign-up attempt email",
              });
            }
          }
        : undefined,
      // Require verification only when mailer exists; otherwise new users lock out.
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
          "Failed to send password reset email",
        );
      },
    },

    emailVerification: {
      // Verification link signs in the clicking device (session lands on whoever opens it).
      autoSignInAfterVerification: true,
      callbackURL: "/",
      // Unverified sign-in 403s include a fresh verification link for the login form.
      sendOnSignIn: true,
      sendVerificationEmail: async ({ url, user }) => {
        await deliver(
          {
            type: "welcome",
            userEmail: user.email,
            userId: user.id,
            username: user.name,
            verificationUrl: url,
          },
          "Failed to send verification email",
        );
      },
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
        // Stage 1: confirm on current email; stage 2 reuses sendVerificationEmail.
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
            "Failed to send change-email confirmation",
          );
        },
      },
    },
  });
};

type Auth = ReturnType<typeof createAuth>;

export { createAuth };
export type { Auth, AuthConfig };
