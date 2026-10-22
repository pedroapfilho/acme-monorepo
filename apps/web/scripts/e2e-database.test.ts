import { execFile } from "node:child_process";
import { createServer } from "node:net";

import { describe, expect, it } from "vitest";

import { assertLocalDatabaseUrl } from "./e2e-database";

describe("E2E database boundary", () => {
  it.each([
    "postgres://test:password@localhost:5432/test",
    "postgresql://test:password@127.0.0.1:5432/test?schema=public",
  ])("accepts loopback PostgreSQL: %s", (url) => {
    expect(() => {
      assertLocalDatabaseUrl(url);
    }).not.toThrow();
  });

  it.each([
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
  ])("rejects malformed or unsupported endpoints: %s", (url) => {
    expect(() => {
      assertLocalDatabaseUrl(url);
    }).toThrow(/Refusing/);
  });

  it("reports only the hostname on refusal", () => {
    expect(() => {
      assertLocalDatabaseUrl("postgres://private-user:secret-password@db.example.com/localhost");
    }).toThrow("Refusing to run ensure-e2e-user.ts against DATABASE_URL host db.example.com.");
  });
});

it("refuses before connecting to Prisma or initializing auth", async () => {
  let connections = 0;

  const server = createServer((socket) => {
    connections += 1;
    socket.destroy();
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const address = server.address();

    if (address === null || typeof address === "string") {
      throw new Error("Expected a TCP listener address");
    }

    let errorOutput = "";

    const execution = new Promise<void>((resolve, reject) => {
      execFile(
        process.execPath,
        ["--import", "tsx", "scripts/ensure-e2e-user.ts"],
        {
          env: {
            ...process.env,
            BETTER_AUTH_SECRET: "",
            DATABASE_URL: `https://private-user:secret-password@127.0.0.1:${address.port}/localhost`,
          },
          timeout: 10_000,
        },
        (error, _stdout, stderr) => {
          errorOutput = stderr;

          if (error instanceof Error) {
            reject(error);
          } else {
            resolve();
          }
        },
      );
    });

    await expect(execution).rejects.toMatchObject({ code: 1 });
    expect(errorOutput).toContain(
      "Refusing to run ensure-e2e-user.ts against DATABASE_URL host 127.0.0.1.",
    );
    expect(errorOutput).not.toContain("secret-password");
    expect(errorOutput).not.toContain("private-user");
    expect(connections).toBe(0);
  } finally {
    server.close();
  }
});
