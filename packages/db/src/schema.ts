import { sql } from "drizzle-orm";
import {
  pgTable,
  index,
  uniqueIndex,
  text,
  timestamp,
  integer,
  bigint,
  boolean,
  foreignKey,
} from "drizzle-orm/pg-core";

export const verification = pgTable(
  "Verification",
  {
    createdAt: timestamp({ mode: "string", precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    expiresAt: timestamp({ mode: "string", precision: 3 }).notNull(),
    id: text().primaryKey().notNull(),
    identifier: text().notNull(),
    updatedAt: timestamp({ mode: "string", precision: 3 })
      .notNull()
      .$onUpdate(() => new Date().toISOString()),
    value: text().notNull(),
  },
  (table) => [
    index("Verification_identifier_idx").using(
      "btree",
      table.identifier.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("Verification_identifier_value_key").using(
      "btree",
      table.identifier.asc().nullsLast().op("text_ops"),
      table.value.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const rateLimit = pgTable(
  "RateLimit",
  {
    count: integer().notNull(),
    id: text().primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    key: text().notNull(),
    lastRequest: bigint({ mode: "number" }).notNull(),
  },
  (table) => [
    uniqueIndex("RateLimit_key_key").using("btree", table.key.asc().nullsLast().op("text_ops")),
  ],
);

export const user = pgTable(
  "User",
  {
    createdAt: timestamp({ mode: "string", precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    displayName: text(),
    displayUsername: text(),
    email: text().notNull(),
    emailVerified: boolean().default(false).notNull(),
    id: text().primaryKey().notNull(),
    image: text(),
    name: text(),
    updatedAt: timestamp({ mode: "string", precision: 3 })
      .notNull()
      .$onUpdate(() => new Date().toISOString()),
    username: text(),
  },
  (table) => [
    uniqueIndex("User_displayUsername_key").using(
      "btree",
      table.displayUsername.asc().nullsLast().op("text_ops"),
    ),
    index("User_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
    uniqueIndex("User_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
    uniqueIndex("User_username_key").using(
      "btree",
      table.username.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const session = pgTable(
  "Session",
  {
    createdAt: timestamp({ mode: "string", precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    expiresAt: timestamp({ mode: "string", precision: 3 }).notNull(),
    id: text().primaryKey().notNull(),
    ipAddress: text(),
    token: text().notNull(),
    updatedAt: timestamp({ mode: "string", precision: 3 })
      .notNull()
      .$onUpdate(() => new Date().toISOString()),
    userAgent: text(),
    userId: text().notNull(),
  },
  (table) => [
    index("Session_token_idx").using("btree", table.token.asc().nullsLast().op("text_ops")),
    uniqueIndex("Session_token_key").using("btree", table.token.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Session_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const account = pgTable(
  "Account",
  {
    accessToken: text(),
    accessTokenExpiresAt: timestamp({ mode: "string", precision: 3 }),
    accountId: text().notNull(),
    createdAt: timestamp({ mode: "string", precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    id: text().primaryKey().notNull(),
    idToken: text(),
    password: text(),
    providerId: text().notNull(),
    refreshToken: text(),
    refreshTokenExpiresAt: timestamp({ mode: "string", precision: 3 }),
    scope: text(),
    updatedAt: timestamp({ mode: "string", precision: 3 })
      .notNull()
      .$onUpdate(() => new Date().toISOString()),
    userId: text().notNull(),
  },
  (table) => [
    uniqueIndex("Account_providerId_accountId_key").using(
      "btree",
      table.providerId.asc().nullsLast().op("text_ops"),
      table.accountId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Account_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);
