import { createAuth } from "@repo/auth/server";
import { prisma } from "@repo/db";
import { nextCookies } from "better-auth/next-js";

// Thin auth instance for server-side session validation only (RSC, proxy).
// Auth HTTP routing lives exclusively in the API.
// nextCookies() must be the last plugin — it intercepts the response to forward
// Set-Cookie headers into server action / RSC context. Any plugin registered
// after it would not see the session cookies it sets.
const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

export const auth = createAuth({
  extraPlugins: [nextCookies()],
  prisma,
  secret,
});
