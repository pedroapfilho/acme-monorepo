import "dotenv/config";

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrate: {
    seed: "tsx src/seed.ts",
  },
  // CLI commands (db push, migrate) need the database URL
  // Falls back gracefully for prisma generate which doesn't need a connection
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
