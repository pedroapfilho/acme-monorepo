import { createAuth } from "@repo/auth/server";
import { prisma } from "@repo/db";
import { nextCookies } from "better-auth/next-js";

// nextCookies() must be last; it forwards Set-Cookie into RSC/server-action context.
// Lazy singleton: defers init so build-time page-data workers don't throw on missing env.
type Auth = ReturnType<typeof createAuth>;
let cachedAuth: Auth | undefined;

const getAuth = (): Auth => {
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

// Proxy for ergonomic imports: `import { auth } from "@/lib/auth"` and use like a singleton,
// but defer instantiation until first use (so build-time env checks don't trip).
const auth = new Proxy({} as Auth, {
  get(_, prop) {
    const instance = getAuth();
    const value = instance[prop as keyof Auth];
    if (typeof value === "function") {
      return (value as (...args: Array<unknown>) => unknown).bind(instance);
    }
    return value;
  },
});

export { auth, getAuth };
