import { createAuth } from "@repo/auth/server";
import { db } from "@repo/db";

import { env } from "./env";

export const auth = createAuth({
  db,
  fromEmail: env.FROM_EMAIL,
  resendApiKey: env.RESEND_API_KEY,
  secret: env.BETTER_AUTH_SECRET,
});
