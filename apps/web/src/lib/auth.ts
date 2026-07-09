import { createAuth } from "@repo/auth/server";
import { prisma } from "@repo/db";
import { nextCookies } from "better-auth/next-js";

// nextCookies() must be last — it forwards Set-Cookie into RSC/server-action context.
// Lazy singleton: defers init so build-time page-data workers don't throw on missing env.
type Auth = ReturnType<typeof createAuth>;
let cachedAuth: Auth | undefined;

export const getAuth = (): Auth => {
  if (!cachedAuth) {
    const secret = process.env.BETTER_AUTH_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error(
        "BETTER_AUTH_SECRET must be set to at least 32 characters (generate with: openssl rand -base64 32)",
      );
    }
    cachedAuth = createAuth({
      extraPlugins: [nextCookies()],
      fromEmail: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      prisma,
      resendApiKey: process.env.RESEND_API_KEY,
      secret,
    });
  }
  return cachedAuth;
};
