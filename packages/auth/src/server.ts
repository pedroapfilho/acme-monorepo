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

    // Explicit to match the Next.js route handler mount at /api/auth/[...all].
    // This is Better Auth's default but stated explicitly to match sibling repos.
    basePath: "/api/auth",

    // Dynamic base URL: Better Auth derives the canonical origin from the
    // incoming request when its host matches `allowedHosts`. `allowedHosts`
    // also auto-extends `trustedOrigins`, so the explicit loopback list below
    // only needs to cover origins that arrive without a matching host header
    // (e.g. cross-origin CI requests where the browser sends localhost:3000
    // but the server thinks it's :4000). See:
    // https://better-auth.com/docs/reference/options#dynamic-base-url
    baseURL: {
      allowedHosts: [
        // Local dev (portless `acme.{web,api,landing}.localhost` is two
        // labels under `.localhost`, so we need `**` not `*`). Plain
        // loopback ports are used by CI and the API server itself.
        "**.localhost",
        "localhost:*",
        "127.0.0.1:*",
        // Production + Vercel previews come from env so this file doesn't
        // hardcode deployment domains.
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
      // requireEmailVerification activates Better Auth's enumeration-prevention
      // path — signing up with an already-registered email returns a synthetic
      // success response. onExistingUserSignUp below notifies the real account
      // holder so they're not left waiting for a verification email that won't
      // arrive. See better-auth docs "Email Enumeration Protection".
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
              // Don't throw — Better Auth's enumeration-prevention path needs
              // to return success regardless. Log so delivery failures don't
              // break the auth response.
              console.error("[Auth] Failed to send sign-up attempt email:", result.error);
            }
          }
        : undefined,
      // Gate on Resend availability rather than NODE_ENV. If no API key is
      // configured we physically can't send a verification email — requiring
      // verification under that condition would lock all new users out
      // (which is what was happening to e2e in CI before this change).
      requireEmailVerification: Boolean(resendApiKey),
      // Always defined so the Better Auth endpoint accepts the request. The
      // actual send only happens when Resend is configured; without it we
      // succeed silently — the test/dev environment doesn't have email infra
      // but the user-visible flow (form submit → redirect) still works.
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
      // Same no-op-without-Resend pattern as sendResetPassword above.
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

    // Fleet-canonical rate-limit shape. CI runs production builds but the
    // e2e suite hammers auth endpoints back-to-back across browsers; the
    // limiter would 429 the suite, so it's gated off when CI is set.
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
    // `allowedHosts` already feeds `trustedOrigins`; the loopback set below
    // covers exact-origin checks for plain `http://localhost:PORT` requests
    // that wouldn't match a host pattern (Better Auth's origin check is
    // exact-string for trustedOrigins).
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
        // Two-step flow: sendChangeEmailConfirmation goes to the CURRENT email
        // for consent. When the link is clicked, Better Auth re-invokes
        // emailVerification.sendVerificationEmail (the signup-verification hook
        // above) targeting the NEW email to confirm mailbox ownership. Same
        // no-op-without-Resend pattern as the other hooks.
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
