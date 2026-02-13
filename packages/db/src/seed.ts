import { prisma } from ".";

const DEFAULT_USERS = [
  {
    id: "1",
    name: "John Doe",
    email: "john@doe.com",
    emailVerified: false,
  },
  {
    id: "2",
    name: "Jane Doe",
    email: "jane@doe.com",
    emailVerified: false,
  },
];

(async () => {
  try {
    const results = await Promise.allSettled(
      DEFAULT_USERS.map((user) =>
        prisma.user.upsert({
          where: {
            id: user.id,
          },
          update: {
            ...user,
          },
          create: {
            ...user,
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

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
