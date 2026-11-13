import "dotenv/config";

import { createPrismaClient } from "./client";

const prisma = createPrismaClient(process.env.DATABASE_URL ?? "");

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
      prisma.user.upsert({ create: user, update: user, where: { id: user.id } }),
    ),
  );

  const failures = results.filter((r) => r.status === "rejected");

  if (failures.length > 0) {
    console.error("Some seed operations failed:", failures);
    throw new Error(`Seed failed: ${failures.length} upsert(s) rejected`);
  }
} finally {
  await prisma.$disconnect();
}
