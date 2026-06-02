/**
 * Idempotent LOCAL-only seed for the E2E test user. Invoked by Playwright's
 * setup spec (and CI) before any other spec runs, so the e2e suite never
 * depends on the local DB being in any particular state — nuke it,
 * re-sync, skip a step, the user will be (re)created on next run.
 *
 * NEVER point this at prod: it creates a known-password user. The
 * hard-coded `postgresql://...@localhost:...` check on DATABASE_URL is
 * the guard.
 *
 * Invoke:
 *   pnpm --filter web exec tsx scripts/ensure-e2e-user.ts
 */

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

  // Upsert returns the actual user row — existing users keep their
  // original id, not SLUG — so use the returned `id` for the account FK.
  const user = await prisma.user.upsert({
    create: {
      email: EMAIL,
      // Better Auth refuses sign-in for unverified accounts when
      // requireEmailVerification is on, so the seeded user has to land
      // already verified. Safe because this script is local-only
      // (DATABASE_URL guard above).
      emailVerified: true,
      id: SLUG,
      name: NAME,
    },
    update: {
      // Re-runs keep existing rows intact. Refresh the verification flag
      // so accounts seeded before this fix get backfilled instead of
      // staying stuck on EMAIL_NOT_VERIFIED.
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
