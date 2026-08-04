import { createAuth } from "@repo/auth/server";
import { prisma } from "@repo/db";

import { authAllowedHosts, authTrustedOrigins, env } from "./env";

export const auth = createAuth({
  allowedHosts: authAllowedHosts,
  fromEmail: env.FROM_EMAIL,
  prisma,
  // Disabled in CI: the e2e suite hammers auth endpoints and would trip 429s.
  rateLimitEnabled: env.NODE_ENV === "production" && (env.CI === undefined || env.CI === ""),
  resendApiKey: env.RESEND_API_KEY,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: authTrustedOrigins,
  // WEB_APP_URL gates Secure cookies; the auth baseURL protocol is "auto", which
  // can't be trusted through portless/Vercel proxies.
  useSecureCookies: env.WEB_APP_URL?.startsWith("https://") === true,
});
