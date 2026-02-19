import "dotenv/config";

import { defineConfig } from "prisma/config";

export default defineConfig({
  migrate: {
    seed: "tsx src/seed.ts",
  },
  schema: "prisma/schema.prisma",
  // CLI commands (db push, migrate) need the database URL
  // Falls back gracefully for prisma generate which doesn't need a connection
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
