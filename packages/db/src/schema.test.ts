import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import { user } from "./schema";

describe("schema parity", () => {
  it("User table has required auth columns", () => {
    const config = getTableConfig(user);
    const columnNames = config.columns.map((c) => c.name);
    expect(columnNames).toContain("id");
    expect(columnNames).toContain("email");
    expect(columnNames).toContain("emailVerified");
    expect(columnNames).toContain("name");
    expect(columnNames).toContain("createdAt");
    expect(columnNames).toContain("updatedAt");
  });
});
