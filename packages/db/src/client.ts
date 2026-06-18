import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as relations from "./relations";
import * as schema from "./schema";

const fullSchema = { ...schema, ...relations };

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle<typeof fullSchema>> | undefined;
};

const createDb = () =>
  drizzle({ client: new Pool({ connectionString: process.env.DATABASE_URL }), schema: fullSchema });

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
