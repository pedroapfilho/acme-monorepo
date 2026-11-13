import { describe, expect, it } from "vitest";

import { createPrismaClient } from "./client";

describe("createPrismaClient", () => {
  it.each(["", "   "])("refuses the blank database URL %j", (databaseUrl) => {
    expect(() => createPrismaClient(databaseUrl)).toThrow("database URL");
  });

  it("builds a client without connecting", () => {
    expect(createPrismaClient("postgresql://user:pass@localhost:5432/db").user).toBeDefined();
  });
});
