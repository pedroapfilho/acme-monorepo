// Idempotent LOCAL-only seed for the e2e test user. The DATABASE_URL loopback
// check below is the guard that keeps this from running against prod.

import { account, db, user } from "@repo/db";

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

  const now = new Date().toISOString();

  // Existing rows keep their original id (not SLUG), so use the returned `id` for the account FK.
  const [upsertedUser] = await db
    .insert(user)
    .values({
      email: EMAIL,
      // requireEmailVerification blocks sign-in for unverified accounts.
      emailVerified: true,
      id: SLUG,
      name: NAME,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      set: {
        emailVerified: true,
        name: NAME,
        updatedAt: now,
      },
      target: user.email,
    })
    .returning({ id: user.id });

  const userId = upsertedUser?.id ?? SLUG;

  await db
    .insert(account)
    .values({
      accountId: userId,
      id: `${userId}-credential`,
      password: hashed,
      providerId: "credential",
      updatedAt: now,
      userId,
    })
    .onConflictDoUpdate({
      set: { password: hashed },
      target: [account.providerId, account.accountId],
    });

  // eslint-disable-next-line no-console -- CI step output: surface the seed result.
  console.log(`✓ e2e user ${EMAIL} ready; password: ${PASSWORD}`);
  await db.$client.end();
};

await main();
