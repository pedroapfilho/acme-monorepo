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
            // Gate on whether BETTER_AUTH_URL is HTTPS, not on NODE_ENV. CI runs
            // production builds (NODE_ENV=production) over HTTP — `secure: true`
            // would make browsers silently drop the cookie, killing the auth flow.
            secure: process.env.BETTER_AUTH_URL?.startsWith("https://") === true,
          },
          name: "session_token",
        },
      },
    },

    // Explicit to match the Next.js route handler mount at /api/auth/[...all].
    // This is Better Auth's default but stated explicitly to match sibling repos.
    basePath: "/api/auth",

    baseURL: resolveBaseUrl(),

    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    emailAndPassword: {
      enabled: true,
      maxPasswordLength: 128,
      minPasswordLength: 12,
      // requireEmailVerification activates Better Auth's enumeration-prevention
      // path — signing up with an already-registered email returns a synthetic
      // success response. onExistingUserSignUp below notifies the real account
      // holder so they're not left waiting for a verification email that won't
      // arrive. See better-auth docs "Email Enumeration Protection".
      onExistingUserSignUp: resendApiKey
        ? async ({ user }, request) => {
            // Derive the web origin from the signup request (CORS already
            // validated it via trustedOrigins) so the email links back to the
            // app the user actually came from.
            const origin = request?.headers.get("origin") ?? "";
            const { Resend } = await import("resend");
            const resend = new Resend(resendApiKey);
            const { error } = await resend.emails.send({
              from: fromEmail,
              html: `<p>Someone tried to create a new acme account using your email address (${user.email}). If this was you, <a href="${origin}/login">sign in</a> or <a href="${origin}/recover">reset your password</a> instead. If not, you can safely ignore this email — no account changes were made.</p>`,
              subject: "Sign-up attempt with your acme account",
              to: user.email,
            });
            if (error) {
              // Don't throw — Better Auth's enumeration-prevention path needs
              // to return success regardless. Log so delivery failures don't
              // break the auth response.
              // eslint-disable-next-line no-console -- temporary until a structured logger lands
              console.error("[Auth] Failed to send sign-up attempt email:", error);
            }
          }
        : undefined,
      // Gate on Resend availability rather than NODE_ENV. If no API key is
      // configured we physically can't send a verification email — requiring
      // verification under that condition would lock all new users out
      // (which is what was happening to e2e in CI before this change).
      requireEmailVerification: Boolean(resendApiKey),
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
      enabled: process.env.NODE_ENV === "production",
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
