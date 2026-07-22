import type { PrismaClient } from "@repo/db";
import { log } from "@repo/observability";
import type { MailerConfig } from "@repo/transactional";
import { sendTransactionalEmail } from "@repo/transactional";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins/bearer";
import { username } from "better-auth/plugins/username";
import type { BetterAuthPlugin } from "better-auth/types";

const parseEnvList = (value: string | undefined): Array<string> => {
  if (value === undefined || value === "") {
    return [];
  }
  const result: Array<string> = [];
  for (const entry of value.split(",")) {
    const trimmed = entry.trim();
    if (trimmed.length > 0) {
      result.push(trimmed);
    }
  }
  return result;
};

type AuthConfig = {
  extraPlugins?: Array<BetterAuthPlugin>;
  fromEmail?: string;
  prisma: PrismaClient;
  resendApiKey?: string;
  secret: string;
};

export const createAuth = (config: AuthConfig) => {
  const {
    extraPlugins = [],
    fromEmail = "noreply@acme.com",
    prisma,
    resendApiKey,
    secret,
  } = config;

  const mailer: MailerConfig | null =
    resendApiKey !== undefined && resendApiKey !== ""
      ? { apiKey: resendApiKey, from: fromEmail }
      : null;

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
      // WEB_APP_URL gates Secure cookies; protocol: "auto" fails through portless/Vercel proxies.
      useSecureCookies: process.env.WEB_APP_URL?.startsWith("https://") === true,
    },

    basePath: "/api/auth",

    // allowedHosts extends trustedOrigins; loopback list covers origins without matching host.
    baseURL: {
      allowedHosts: [
        // Portless *.localhost needs ** not * (two labels under .localhost).
        "**.localhost",
        "localhost:*",
        "127.0.0.1:*",
        ...parseEnvList(process.env.AUTH_ALLOWED_HOSTS),
      ],
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
        if (!mailer) {
          return;
        }
        const result = await sendTransactionalEmail(
          {
            resetUrl: url,
            type: "password-reset",
            userEmail: user.email,
            userId: user.id,
            username: user.name,
          },
          mailer,
        );
        if (!result.success) {
          throw new Error(`Failed to send password reset email: ${result.error}`);
        }
      },
    },

    emailVerification: {
      // Verification link signs in the clicking device (session lands on whoever opens it).
      autoSignInAfterVerification: true,
      callbackURL: "/",
      // Unverified sign-in 403s include a fresh verification link for the login form.
      sendOnSignIn: true,
      sendVerificationEmail: async ({ url, user }) => {
        if (!mailer) {
          return;
        }
        const result = await sendTransactionalEmail(
          {
            type: "welcome",
            userEmail: user.email,
            userId: user.id,
            username: user.name,
            verificationUrl: url,
          },
          mailer,
        );
        if (!result.success) {
          throw new Error(`Failed to send verification email: ${result.error}`);
        }
      },
    },

    plugins: [username(), bearer(), ...extraPlugins],

    // Disabled in CI: e2e suite hammers auth endpoints and would trip 429s.
    rateLimit: {
      enabled:
        process.env.NODE_ENV === "production" &&
        (process.env.CI === undefined || process.env.CI === ""),
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
    // Plain http://localhost:PORT origins won't match allowedHosts patterns.
    trustedOrigins: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:4000",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:4000",
      ...parseEnvList(process.env.TRUSTED_ORIGINS),
    ],
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
          if (!mailer) {
            return;
          }
          const result = await sendTransactionalEmail(
            {
              changeUrl: url,
              currentEmail: user.email,
              newEmail,
              type: "change-email-confirmation",
              userId: user.id,
              username: user.name,
            },
            mailer,
          );
          if (!result.success) {
            throw new Error(`Failed to send change-email confirmation: ${result.error}`);
          }
        },
      },
    },
  });
};

export type Auth = ReturnType<typeof createAuth>;
export type { AuthConfig };
