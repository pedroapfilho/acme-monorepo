import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "./generated/prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const assertDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (url === undefined || url.trim() === "") {
    throw new Error(
      "DATABASE_URL is not set. Set it in the environment; packages/db/.env.example has the local value.",
    );
  }
};

class PrismaPgRequiringUrl extends PrismaPg {
  override async connect() {
    assertDatabaseUrl();
    return super.connect();
  }
}

const createPrismaClient = () => {
  const adapter = new PrismaPgRequiringUrl({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
};

export const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export * from "./generated/prisma/client";
