import type { PrismaClient } from "@repo/db";
import {
  sendChangeEmailConfirmation,
  sendPasswordResetEmail,
  sendSignUpAttemptEmail,
  sendWelcomeEmail,
} from "@repo/transactional";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins/bearer";
import { username } from "better-auth/plugins/username";
import type { BetterAuthPlugin } from "better-auth/types";

const parseEnvList = (value: string | undefined): Array<string> => {
  if (!value) {
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
      // `protocol: "auto"` doesn't reliably detect HTTPS through portless/Vercel reverse proxies;
      // WEB_APP_URL is the explicit signal. Unset in CI keeps cookies on plain HTTP.
      useSecureCookies: process.env.WEB_APP_URL?.startsWith("https://") === true,
    },

    // Matches the Next.js route handler mount at /api/auth/[...all].
    basePath: "/api/auth",

    // allowedHosts auto-extends trustedOrigins; loopback list below covers
    // origins arriving without a matching host header.
    // https://better-auth.com/docs/reference/options#dynamic-base-url
    baseURL: {
      allowedHosts: [
        // portless `acme.{web,api,landing}.localhost` is two labels under
        // `.localhost`, so `**` not `*`.
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
      // Notifies the real account holder when a duplicate signup is silently
      // swallowed by Better Auth's enumeration-prevention path.
      onExistingUserSignUp: resendApiKey
        ? async ({ user }, request) => {
            const origin = request?.headers.get("origin") ?? "";
            const result = await sendSignUpAttemptEmail(
              {
                resetPasswordUrl: `${origin}/recover`,
                signInUrl: `${origin}/login`,
                userEmail: user.email,
                userId: user.id,
                username: user.name,
              },
              { apiKey: resendApiKey, from: fromEmail },
            );
            if (!result.success) {
              // Don't throw: enumeration-prevention must return success regardless.
              console.error("[Auth] Failed to send sign-up attempt email:", result.error);
            }
          }
        : undefined,
      // Gated on Resend availability: without an API key we can't deliver,
      // so requiring verification would lock every new user out.
      requireEmailVerification: Boolean(resendApiKey),
      // Always wired so the endpoint accepts the request; send is gated on resendApiKey.
      sendResetPassword: async ({ url, user }) => {
        if (!resendApiKey) {
          return;
        }
        const result = await sendPasswordResetEmail(
          {
            resetUrl: url,
            userEmail: user.email,
            userId: user.id,
            username: user.name,
          },
          { apiKey: resendApiKey, from: fromEmail },
        );
        if (!result.success) {
          throw new Error(`Failed to send password reset email: ${result.error}`);
        }
      },
    },

    emailVerification: {
      autoSignInAfterVerification: true,
      callbackURL: "/verify-email/success",
      sendVerificationEmail: async ({ url, user }) => {
        if (!resendApiKey) {
          return;
        }
        const result = await sendWelcomeEmail(
          {
            userEmail: user.email,
            userId: user.id,
            username: user.name,
            verificationUrl: url,
          },
          { apiKey: resendApiKey, from: fromEmail },
        );
        if (!result.success) {
          throw new Error(`Failed to send verification email: ${result.error}`);
        }
      },
    },

    plugins: [username(), bearer(), ...extraPlugins],

    // Disabled in CI: e2e suite hammers auth endpoints and would trip 429s.
    rateLimit: {
      enabled: process.env.NODE_ENV === "production" && !process.env.CI,
      max: 100,
      storage: "database",
      window: 60,
    },

    secret,

    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes
      },
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      storeSessionInDatabase: true,
      updateAge: 60 * 60 * 24, // Update session if older than 1 day
    },
    // Exact-string match list for plain http://localhost:PORT origins that
    // wouldn't match an allowedHosts pattern.
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
        // Stage 1 of the two-step change flow: confirmation to the CURRENT email.
        // Stage 2 (verification to the NEW email) reuses sendVerificationEmail above.
        sendChangeEmailConfirmation: async ({ newEmail, url, user }) => {
          if (!resendApiKey) {
            return;
          }
          const result = await sendChangeEmailConfirmation(
            {
              changeUrl: url,
              currentEmail: user.email,
              newEmail,
              userId: user.id,
              username: user.name,
            },
            { apiKey: resendApiKey, from: fromEmail },
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
