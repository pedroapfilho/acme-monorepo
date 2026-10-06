import { envAuthConfig } from "@repo/auth/env-config";
import { createAuth, prismaDatabase } from "@repo/auth/server";
import { prisma } from "@repo/db";

import { env } from "./env";

export const auth = createAuth({
  ...envAuthConfig(),
  database: prismaDatabase(prisma),
  secret: env.BETTER_AUTH_SECRET,
});
