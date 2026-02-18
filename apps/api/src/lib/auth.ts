import { createAuth } from "@repo/auth/server";
import { prisma } from "@repo/db";

import { env } from "./env";

export const auth = createAuth({
  prisma,
  secret: env.BETTER_AUTH_SECRET,
  resendApiKey: env.RESEND_API_KEY,
  fromEmail: env.FROM_EMAIL,
});
