import { createPrismaClient } from "@repo/db";

import { env } from "./env";

export const prisma = createPrismaClient(env.DATABASE_URL);
