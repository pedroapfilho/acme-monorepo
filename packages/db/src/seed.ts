import { prisma } from ".";

const DEFAULT_USERS = [
  {
    id: "1",
    name: "John Doe",
    email: "john@doe.com",
    phone: "1234567890",
    password: "supersecret",
    salt: "salt",
  },
  {
    id: "2",
    name: "Jane Doe",
    email: "jane@doe.com",
    phone: "1234567890",
    password: "secret",
    salt: "sugar",
  },
];

(async () => {
  try {
    await Promise.all(
      DEFAULT_USERS.map((user) =>
        prisma.user.upsert({
          where: {
            id: user.id!,
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
  } catch (error) {
    console.error(error);

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
