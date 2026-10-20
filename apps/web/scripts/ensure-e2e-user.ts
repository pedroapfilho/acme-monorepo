import { envAuthConfig } from "@repo/auth/env-config";
import { createAuth, prismaDatabase } from "@repo/auth/server";
import { prisma } from "@repo/db";

import { getEnv } from "@/lib/env";

import { TEST_USER } from "../../../tests/e2e/fixtures/test-user";

import { assertLocalDatabaseUrl } from "./e2e-database";

const ensureE2eUser = async () => {
  assertLocalDatabaseUrl(process.env.DATABASE_URL ?? "");

  // No mailer: sign-up then neither requires verification nor sends mail to the unroutable address.
  const auth = createAuth({
    ...envAuthConfig(),
    database: prismaDatabase(prisma),
    secret: getEnv().BETTER_AUTH_SECRET,
  });

  await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
  const { user } = await auth.api.signUpEmail({ body: TEST_USER });
  await prisma.user.update({ data: { emailVerified: true }, where: { id: user.id } });

  console.log(`✓ e2e user ${TEST_USER.email} ready; password: ${TEST_USER.password}`);
  await prisma.$disconnect();
};

await ensureE2eUser();
