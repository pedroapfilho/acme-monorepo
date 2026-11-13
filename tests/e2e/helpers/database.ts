import { createPrismaClient } from "@repo/db";

export const prisma = createPrismaClient(process.env.DATABASE_URL ?? "");
