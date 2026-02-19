import { createAuth } from "@repo/auth/server";
import { prisma } from "@repo/db";

import { env } from "./env";

export const auth = createAuth({
  fromEmail: env.FROM_EMAIL,
  prisma,
  resendApiKey: env.RESEND_API_KEY,
  secret: env.BETTER_AUTH_SECRET,
});
