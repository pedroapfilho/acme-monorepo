import "dotenv/config";

import { defineConfig } from "prisma/config";

export default defineConfig({
  migrate: {
    seed: "tsx src/seed.ts",
  },
  schema: "prisma/schema.prisma",
  // Migrate needs DATABASE_URL; empty string is fine for prisma generate.
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
