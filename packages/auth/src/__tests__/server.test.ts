import { prisma } from "@repo/db";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createAuth } from "../server";
import type { AuthConfig } from "../server";

type Plugin = NonNullable<AuthConfig["extraPlugins"]>[number];

describe("Auth Server Configuration", () => {
  let auth: ReturnType<typeof createAuth>;

  beforeAll(() => {
    auth = createAuth({ prisma, secret: "test-secret-minimum-32-characters-long" });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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
    vi.stubEnv("NODE_ENV", "production");

    const prodAuth = createAuth({ prisma, secret: "test-secret-minimum-32-characters-long" });
    expect(prodAuth.options.advanced?.cookies?.session_token?.attributes?.secure).toBe(true);
    expect(prodAuth.options.advanced?.cookies?.session_token?.attributes?.httpOnly).toBe(true);
    expect(prodAuth.options.advanced?.cookies?.session_token?.attributes?.sameSite).toBe("lax");
  });

  it("should require email verification in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    const prodAuth = createAuth({ prisma, secret: "test-secret-minimum-32-characters-long" });
    expect(prodAuth.options.emailAndPassword?.requireEmailVerification).toBe(true);
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

  it("should use database storage for rate limiting", () => {
    expect(auth.options.rateLimit?.storage).toBe("database");
  });

  it("should have rate limiting enabled with correct window and max", () => {
    expect(auth.options.rateLimit?.enabled).toBe(true);
    expect(auth.options.rateLimit?.window).toBe(60);
    expect(auth.options.rateLimit?.max).toBe(10);
  });

  it("should parse TRUSTED_ORIGINS env var as comma-separated list", () => {
    vi.stubEnv("TRUSTED_ORIGINS", "https://app.acme.com,https://api.acme.com");

    const envAuth = createAuth({ prisma, secret: "test-secret-minimum-32-characters-long" });
    expect(envAuth.options.trustedOrigins).toEqual([
      "https://app.acme.com",
      "https://api.acme.com",
    ]);
  });

  it("should not configure reset password email when resendApiKey is absent", () => {
    expect(auth.options.emailAndPassword?.sendResetPassword).toBeUndefined();
  });

  it("should configure reset password email when resendApiKey is provided", () => {
    const emailAuth = createAuth({
      prisma,
      resendApiKey: "re_test_key",
      secret: "test-secret-minimum-32-characters-long",
    });
    expect(emailAuth.options.emailAndPassword?.sendResetPassword).toBeDefined();
  });

  it("should expire sessions after 7 days", () => {
    expect(auth.options.session?.expiresIn).toBe(60 * 60 * 24 * 7);
  });

  it("should refresh sessions that are older than 1 day", () => {
    expect(auth.options.session?.updateAge).toBe(60 * 60 * 24);
  });

  it("should include extra plugins in the resolved plugin list", () => {
    const mockPlugin = { id: "test-plugin", init: () => ({}) } as unknown as Plugin;
    const extendedAuth = createAuth({
      extraPlugins: [mockPlugin],
      prisma,
      secret: "test-secret-minimum-32-characters-long",
    });
    const plugins = extendedAuth.options.plugins ?? [];
    expect(plugins.some((p) => p.id === "test-plugin")).toBe(true);
  });
});
