import "dotenv/config";

import { db } from "./client";
import { user } from "./schema";

const DEFAULT_USERS = [
  {
    email: "john@doe.com",
    emailVerified: false,
    id: "1",
    name: "John Doe",
    updatedAt: new Date().toISOString(),
  },
  {
    email: "jane@doe.com",
    emailVerified: false,
    id: "2",
    name: "Jane Doe",
    updatedAt: new Date().toISOString(),
  },
];

try {
  const results = await Promise.allSettled(
    DEFAULT_USERS.map((u) =>
      db.insert(user).values(u).onConflictDoUpdate({ set: u, target: user.id }),
    ),
  );

  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0) {
    console.error("Some seed operations failed:", failures);
    // Surface partial failures as a non-zero exit — a green `pnpm db:seed` on a
    // half-seeded database masks broken schema/data in dev and CI.
    throw new Error(`Seed failed: ${failures.length} upsert(s) rejected`);
  }
} catch (error) {
  console.error(error);
  // Re-throw so the script exits non-zero with a stack trace; replaces
  // process.exit(1) per unicorn/no-process-exit. Pool teardown on process exit.
  throw error;
}
