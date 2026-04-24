import { execFileSync } from "node:child_process";

import type { PrismaClient } from "@repo/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins/bearer";
import { username } from "better-auth/plugins/username";
import type { BetterAuthPlugin } from "better-auth/types";

const getPortlessUrl = (name: string) => {
  if (process.env.CI) {
    return undefined;
  }
  try {
    return execFileSync("portless", ["get", name], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined;
  }
};

const resolveBaseUrl = (): string => {
  if (process.env.NODE_ENV === "production" || process.env.CI) {
    return process.env.BETTER_AUTH_URL || "http://localhost:4000";
  }
  return getPortlessUrl("acme.api") ?? process.env.BETTER_AUTH_URL ?? "http://localhost:4000";
};

const defaultTrustedOrigins = () => {
  const origins = ["http://localhost:3000", "http://localhost:3001", "http://localhost:4000"];

  const portlessNames = ["acme.web", "acme.landing", "acme.api"];
  for (const name of portlessNames) {
    const url = getPortlessUrl(name);
    if (url) {
      origins.push(url);
    }
  }

  return origins;
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
      cookies: {
        session_token: {
          attributes: {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          },
          name: "session_token",
        },
      },
    },

    // The API mounts `app.on(["POST", "GET"], "/auth/*", auth.handler)` — Better Auth's default
    // `/api/auth` base path doesn't match incoming request paths, making the router 404.
    basePath: "/auth",

    baseURL: resolveBaseUrl(),

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
            const { error } = await resend.emails.send({
              from: fromEmail,
              html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
              subject: "Reset your password",
              to: user.email,
            });
            if (error) {
              throw new Error(`Failed to send password reset email: ${error.message}`);
            }
          }
        : undefined,
    },

    emailVerification: {
      sendVerificationEmail: resendApiKey
        ? async ({ url, user }) => {
            const { Resend } = await import("resend");
            const resend = new Resend(resendApiKey);
            const { error } = await resend.emails.send({
              from: fromEmail,
              html: `<p>Click <a href="${url}">here</a> to verify your email address.</p>`,
              subject: "Verify your email address",
              to: user.email,
            });
            if (error) {
              throw new Error(`Failed to send verification email: ${error.message}`);
            }
          }
        : undefined,
    },

    plugins: [username(), bearer(), ...extraPlugins],

    rateLimit: {
      enabled: true,
      max: 10,
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
      updateAge: 60 * 60 * 24, // Update if older than 1 day
    },
    trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") || defaultTrustedOrigins(),
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
