import type { PrismaClient } from "@repo/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, username } from "better-auth/plugins";
import type { BetterAuthPlugin } from "better-auth/types";

type AuthConfig = {
  prisma: PrismaClient;
  secret: string;
  resendApiKey?: string;
  fromEmail?: string;
  extraPlugins?: BetterAuthPlugin[];
};

export const createAuth = (config: AuthConfig) => {
  const {
    prisma,
    secret,
    resendApiKey,
    fromEmail = "noreply@acme.com",
    extraPlugins = [],
  } = config;

  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: process.env.NODE_ENV === "production",
      minPasswordLength: 12,
      maxPasswordLength: 128,
      sendResetPassword: resendApiKey
        ? async ({ user, url }) => {
            const { Resend } = await import("resend");
            const resend = new Resend(resendApiKey);
            // Non-blocking to prevent timing attacks, but log failures
            resend.emails
              .send({
                from: fromEmail,
                to: user.email,
                subject: "Reset your password",
                html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
              })
              .catch((error) => {
                console.error("Failed to send password reset email:", error);
              });
          }
        : undefined,
    },

    emailVerification: {
      sendVerificationEmail: resendApiKey
        ? async ({ user, url }) => {
            const { Resend } = await import("resend");
            const resend = new Resend(resendApiKey);
            // Non-blocking to prevent timing attacks, but log failures
            resend.emails
              .send({
                from: fromEmail,
                to: user.email,
                subject: "Verify your email address",
                html: `<p>Click <a href="${url}">here</a> to verify your email address.</p>`,
              })
              .catch((error) => {
                console.error("Failed to send verification email:", error);
              });
          }
        : undefined,
    },

    plugins: [
      username(),
      bearer(),
      ...extraPlugins,
    ],

    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update if older than 1 day
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes
      },
    },

    advanced: {
      cookiePrefix: "acme",
      cookies: {
        session_token: {
          name: "session_token",
          attributes: {
            sameSite: "lax" as const,
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
          },
        },
      },
    },

    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["email"],
      },
    },

    user: {
      additionalFields: {
        displayName: {
          type: "string",
          required: false,
          defaultValue: null,
        },
      },
    },

    rateLimit: {
      enabled: true,
      window: 60, // 1 minute
      max: 10, // 10 requests per minute
    },

    secret,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
    trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") || [
      "http://localhost:3000", // Web app
      "http://localhost:3001", // Landing
      "http://localhost:4000", // API
    ],
  });
};

export type Auth = ReturnType<typeof createAuth>;
export type { AuthConfig };
