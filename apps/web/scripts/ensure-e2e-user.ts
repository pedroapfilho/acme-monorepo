import { prisma } from "@repo/db";

import { getAuth } from "@/lib/auth";

import { TEST_USER } from "../../../tests/e2e/fixtures/test-user";

const { email: EMAIL, name: NAME, password: PASSWORD } = TEST_USER;
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

  // eslint-disable-next-line react-doctor/server-sequential-independent-await -- Hash first so a hashing failure cannot leave a partially seeded user.
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
      issuer: "local:credential",
      password: hashed,
      providerId: "credential",
      userId: user.id,
    },
    update: { password: hashed },
    where: { issuer_accountId: { accountId: user.id, issuer: "local:credential" } },
  });

  // eslint-disable-next-line no-console -- CI step output: surface the seed result.
  console.log(`✓ e2e user ${EMAIL} ready; password: ${PASSWORD}`);
  await prisma.$disconnect();
};

await main();
