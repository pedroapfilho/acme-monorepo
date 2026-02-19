import type { PrismaClient } from "@repo/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, username } from "better-auth/plugins";
import type { BetterAuthPlugin } from "better-auth/types";

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
      cookies: {
        session_token: {
          attributes: {
            httpOnly: true,
            sameSite: "lax" as const,
            secure: process.env.NODE_ENV === "production",
          },
          name: "session_token",
        },
      },
    },

    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",

    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    emailAndPassword: {
      enabled: true,
      maxPasswordLength: 128,
      minPasswordLength: 12,
      requireEmailVerification: process.env.NODE_ENV === "production",
      sendResetPassword: resendApiKey
        ? async ({ url, user }) => {
            const { Resend } = await import("resend");
            const resend = new Resend(resendApiKey);
            // Non-blocking to prevent timing attacks, but log failures
            resend.emails
              .send({
                from: fromEmail,
                html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
                subject: "Reset your password",
                to: user.email,
              })
              .catch((error) => {
                // eslint-disable-next-line no-console -- server-side email failure logging
                console.error("Failed to send password reset email:", error);
              });
          }
        : undefined,
    },

    emailVerification: {
      sendVerificationEmail: resendApiKey
        ? async ({ url, user }) => {
            const { Resend } = await import("resend");
            const resend = new Resend(resendApiKey);
            // Non-blocking to prevent timing attacks, but log failures
            resend.emails
              .send({
                from: fromEmail,
                html: `<p>Click <a href="${url}">here</a> to verify your email address.</p>`,
                subject: "Verify your email address",
                to: user.email,
              })
              .catch((error) => {
                // eslint-disable-next-line no-console -- server-side email failure logging
                console.error("Failed to send verification email:", error);
              });
          }
        : undefined,
    },

    plugins: [username(), bearer(), ...extraPlugins],

    rateLimit: {
      enabled: true,
      max: 10, // 10 requests per minute
      window: 60, // 1 minute
    },

    secret,

    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes
      },
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update if older than 1 day
    },
    trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") || [
      "http://localhost:3000", // Web app
      "http://localhost:3001", // Landing
      "http://localhost:4000", // API
    ],
    user: {
      additionalFields: {
        displayName: {
          defaultValue: null,
          required: false,
          type: "string",
        },
      },
    },
  });
};

export type Auth = ReturnType<typeof createAuth>;
export type { AuthConfig };
