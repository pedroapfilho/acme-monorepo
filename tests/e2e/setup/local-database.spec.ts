import { expect, test } from "@playwright/test";

import { assertLocalDatabaseUrl } from "./local-database";

test.describe("E2E database boundary", () => {
  for (const url of [
    "postgres://test:password@localhost:5432/test",
    "postgresql://test:password@127.0.0.1:5432/test?schema=public",
  ]) {
    test(`accepts loopback PostgreSQL: ${url}`, () => {
      expect(() => {
        assertLocalDatabaseUrl(url);
      }).not.toThrow();
    });
  }

  for (const url of [
    "",
    "not a URL",
    "postgresql://localhost:invalid/test",
    "https://localhost/test",
    "postgresql://db.example.com/localhost",
    "postgresql://localhost:password@db.example.com/test",
    "postgresql://test:127.0.0.1@db.example.com/test",
    "postgresql://localhost.example.com/test",
    "postgresql://127.0.0.1.example.com/test",
    "postgresql://[::1]/test",
    "postgresql://localhost/test?host=db.example.com",
    "postgresql://localhost/test?host=127.0.0.1&host=db.example.com",
  ]) {
    test(`rejects malformed or unsupported endpoints: ${url}`, () => {
      expect(() => {
        assertLocalDatabaseUrl(url);
      }).toThrow(/Refusing/v);
    });
  }

  test("reports only the hostname on refusal", () => {
    expect(() => {
      assertLocalDatabaseUrl("postgres://private-user:secret-password@db.example.com/localhost");
    }).toThrow("Refusing to run the e2e suite against DATABASE_URL host db.example.com.");
  });
});
