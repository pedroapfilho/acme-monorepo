import "dotenv/config";

import { prisma } from ".";

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
  }
} catch (error) {
  console.error(error);
  // Re-throw so the script exits non-zero with a stack trace; replaces
  // process.exit(1) per unicorn/no-process-exit. Disconnect runs in `finally`.
  throw error;
} finally {
  await prisma.$disconnect();
}
