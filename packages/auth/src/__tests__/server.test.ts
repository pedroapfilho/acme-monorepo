import { PrismaClient } from "@repo/db";
import { describe, it, expect, beforeAll } from "vitest";

import { createAuth } from "../server";

describe("Auth Server Configuration", () => {
  let auth: ReturnType<typeof createAuth>;
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
    auth = createAuth({ prisma, secret: "test-secret-minimum-32-characters-long" });
  });

  it("should have email and password authentication enabled", () => {
    expect(auth.options.emailAndPassword?.enabled).toBe(true);
  });

  it("should require 12 character minimum password", () => {
    expect(auth.options.emailAndPassword?.minPasswordLength).toBe(12);
  });

  it("should have maximum password length of 128", () => {
    expect(auth.options.emailAndPassword?.maxPasswordLength).toBe(128);
  });

  it("should have cookie cache enabled", () => {
    expect(auth.options.session?.cookieCache?.enabled).toBe(true);
  });

  it("should have 5 minute cookie cache max age", () => {
    expect(auth.options.session?.cookieCache?.maxAge).toBe(5 * 60);
  });

  it("should use acme cookie prefix", () => {
    expect(auth.options.advanced?.cookiePrefix).toBe("acme");
  });

  it("should have secure cookie settings in production", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const prodAuth = createAuth({ prisma, secret: "test-secret-minimum-32-characters-long" });
    expect(prodAuth.options.advanced?.cookies?.session_token?.attributes?.secure).toBe(true);
    expect(prodAuth.options.advanced?.cookies?.session_token?.attributes?.httpOnly).toBe(true);
    expect(prodAuth.options.advanced?.cookies?.session_token?.attributes?.sameSite).toBe("lax");

    process.env.NODE_ENV = originalEnv;
  });

  it("should require email verification in production", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const prodAuth = createAuth({ prisma, secret: "test-secret-minimum-32-characters-long" });
    expect(prodAuth.options.emailAndPassword?.requireEmailVerification).toBe(true);

    process.env.NODE_ENV = originalEnv;
  });

  it("should have bearer token plugin enabled", () => {
    const plugins = auth.options.plugins || [];
    const hasBearerToken = plugins.some((plugin) => plugin.id === "bearer-token");
    expect(hasBearerToken).toBe(true);
  });

  it("should have username plugin enabled", () => {
    const plugins = auth.options.plugins || [];
    const hasUsername = plugins.some((plugin) => plugin.id === "username");
    expect(hasUsername).toBe(true);
  });

  it("should use custom session token name", () => {
    expect(auth.options.advanced?.cookies?.session_token?.name).toBe("session_token");
  });

  it("should have account linking enabled", () => {
    expect(auth.options.account?.accountLinking?.enabled).toBe(true);
  });

  it("should trust host by default", () => {
    expect(auth.options.trustedOrigins).toContain("http://localhost:3000");
  });
});
