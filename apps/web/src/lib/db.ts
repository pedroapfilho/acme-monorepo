import { createPrismaClient } from "@repo/db";
import type { PrismaClient } from "@repo/db";

import { getEnv } from "./env";

declare global {
  var prisma: PrismaClient | undefined;
}

// On globalThis: Next loads this module once per bundle layer and again on every dev reload, and each client opens a pool.
const getPrisma = () => (globalThis.prisma ??= createPrismaClient(getEnv().DATABASE_URL));

export { getPrisma };
