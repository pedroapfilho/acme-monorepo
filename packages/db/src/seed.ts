import "dotenv/config";

import { prisma } from "./client";

const DEFAULT_USERS = [
  {
    email: "john@doe.com",
    emailVerified: false,
    id: "1",
    name: "John Doe",
  },
  {
    email: "jane@doe.com",
    emailVerified: false,
    id: "2",
    name: "Jane Doe",
  },
];

try {
  const results = await Promise.allSettled(
    DEFAULT_USERS.map((user) =>
      prisma.user.upsert({
        create: {
          ...user,
        },
        update: {
          ...user,
        },
        where: {
          id: user.id,
        },
      }),
    ),
  );

  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0) {
    console.error("Some seed operations failed:", failures);
    // Fail on partial upserts; green seed on half-seeded DB masks broken schema in dev/CI.
    throw new Error(`Seed failed: ${failures.length} upsert(s) rejected`);
  }
} catch (error) {
  console.error(error);
  // Re-throw for non-zero exit (unicorn/no-process-exit); disconnect runs in finally.
  throw error;
} finally {
  await prisma.$disconnect();
}
