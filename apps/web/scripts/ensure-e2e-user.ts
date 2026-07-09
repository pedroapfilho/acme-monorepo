// LOCAL-only e2e seed; the DATABASE_URL loopback check below blocks prod runs.

import { prisma } from "@repo/db";

import { getAuth } from "@/lib/auth";

const EMAIL = "e2e-test@acme.localhost";
const NAME = "E2E Test User";
const PASSWORD = "TestPassword123!";
const SLUG = "e2e-test-user";

const main = async () => {
  const dbUrl = process.env.DATABASE_URL ?? "";
  const isLocal =
    (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) &&
    (dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1"));
  if (!isLocal) {
    throw new Error(
      `Refusing to run ensure-e2e-user.ts against non-local DATABASE_URL (${dbUrl}).`,
    );
  }

  const ctx = await getAuth().$context;
  const hashed = await ctx.password.hash(PASSWORD);

  // Existing rows keep their original id (not SLUG), so use the returned `id` for the account FK.
  const user = await prisma.user.upsert({
    create: {
      email: EMAIL,
      emailVerified: true,
      id: SLUG,
      name: NAME,
    },
    update: {
      emailVerified: true,
      name: NAME,
    },
    where: { email: EMAIL },
  });

  await prisma.account.upsert({
    create: {
      accountId: user.id,
      password: hashed,
      providerId: "credential",
      userId: user.id,
    },
    update: { password: hashed },
    where: { providerId_accountId: { accountId: user.id, providerId: "credential" } },
  });

  // eslint-disable-next-line no-console -- CI step output: surface the seed result.
  console.log(`✓ e2e user ${EMAIL} ready; password: ${PASSWORD}`);
  await prisma.$disconnect();
};

await main();
