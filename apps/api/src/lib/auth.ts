import { createAuth } from "@repo/auth/server";
import { prisma } from "@repo/db";

import { authAllowedHosts, authTrustedOrigins, env } from "./env";

export const auth = createAuth({
  allowedHosts: authAllowedHosts,
  fromEmail: env.FROM_EMAIL,
  prisma,
  rateLimitEnabled: env.NODE_ENV === "production" && (env.CI === undefined || env.CI === ""),
  resendApiKey: env.RESEND_API_KEY,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: authTrustedOrigins,
  useSecureCookies: env.WEB_APP_URL?.startsWith("https://") === true,
});
