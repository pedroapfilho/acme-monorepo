import { createAuth } from "@repo/auth/server";
import { prisma } from "@repo/db";
import { nextCookies } from "better-auth/next-js";

const parseEnvList = (value: string | undefined): Array<string> => {
  if (value === undefined || value === "") {
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

// Portless *.localhost needs ** not * (two labels under .localhost).
const LOCALHOST_ALLOWED_HOSTS = ["**.localhost", "localhost:*", "127.0.0.1:*"];

// Plain http://localhost:PORT origins won't match allowedHosts patterns.
const LOOPBACK_TRUSTED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:4000",
];

// nextCookies() must be last; it forwards Set-Cookie into RSC/server-action context.
// Lazy singleton: defers init so build-time page-data workers don't throw on missing env.
type Auth = ReturnType<typeof createAuth>;
let cachedAuth: Auth | undefined;

const getAuth = (): Auth => {
  if (!cachedAuth) {
    const secret = process.env.BETTER_AUTH_SECRET;
    if (secret === undefined || secret.length < 32) {
      throw new Error(
        "BETTER_AUTH_SECRET must be set to at least 32 characters (generate with: openssl rand -base64 32)",
      );
    }
    cachedAuth = createAuth({
      allowedHosts: [...LOCALHOST_ALLOWED_HOSTS, ...parseEnvList(process.env.AUTH_ALLOWED_HOSTS)],
      extraPlugins: [nextCookies()],
      fromEmail: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      prisma,
      // Disabled in CI: the e2e suite hammers auth endpoints and would trip 429s.
      rateLimitEnabled:
        process.env.NODE_ENV === "production" &&
        (process.env.CI === undefined || process.env.CI === ""),
      resendApiKey: process.env.RESEND_API_KEY,
      secret,
      trustedOrigins: [...LOOPBACK_TRUSTED_ORIGINS, ...parseEnvList(process.env.TRUSTED_ORIGINS)],
      // WEB_APP_URL gates Secure cookies; the auth baseURL protocol is "auto", which
      // can't be trusted through portless/Vercel proxies.
      useSecureCookies: process.env.WEB_APP_URL?.startsWith("https://") === true,
    });
  }
  return cachedAuth;
};

// Proxy for ergonomic imports: `import { auth } from "@/lib/auth"` and use like a singleton,
// but defer instantiation until first use (so build-time env checks don't trip).
// oxlint-disable no-unsafe-type-assertion -- the Proxy impersonates Auth by design; its target is an empty stand-in and property access is forwarded dynamically.
const auth = new Proxy({} as Auth, {
  get(_, prop): unknown {
    const instance = getAuth();
    const value = instance[prop as keyof Auth];
    if (typeof value === "function") {
      return (value as (...args: Array<unknown>) => unknown).bind(instance);
    }
    return value;
  },
});
// oxlint-enable no-unsafe-type-assertion

export { auth, getAuth };
