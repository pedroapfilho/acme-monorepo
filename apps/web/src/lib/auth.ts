import { createAuth } from "@repo/auth/server";
import { prisma } from "@repo/db";
import { nextCookies } from "better-auth/next-js";

// Thin auth instance for server-side session validation only (middleware, RSC)
// Auth HTTP routing lives exclusively in the API
// nextCookies() must be last — enables automatic cookie setting in server actions/RSC
const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

export const auth = createAuth({
  prisma,
  secret,
  extraPlugins: [nextCookies()],
});
