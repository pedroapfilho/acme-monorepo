import { prisma } from "@repo/db";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createAuth } from "./server";
import type { AuthConfig } from "./server";

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

  it("should have secure cookies when BETTER_AUTH_URL is HTTPS", () => {
    vi.stubEnv("BETTER_AUTH_URL", "https://acme.example");

    const prodAuth = createAuth({ prisma, secret: "test-secret-minimum-32-characters-long" });
    expect(prodAuth.options.advanced?.useSecureCookies).toBe(true);
    expect(prodAuth.options.advanced?.defaultCookieAttributes?.httpOnly).toBe(true);
    expect(prodAuth.options.advanced?.defaultCookieAttributes?.sameSite).toBe("lax");
  });

  it("should not set secure cookies when BETTER_AUTH_URL is HTTP (e.g. CI over plain HTTP)", () => {
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");

    const httpAuth = createAuth({ prisma, secret: "test-secret-minimum-32-characters-long" });
    expect(httpAuth.options.advanced?.useSecureCookies).toBe(false);
  });

  it("should require email verification when Resend is configured", () => {
    const verifyingAuth = createAuth({
      prisma,
      resendApiKey: "re_test_key",
      secret: "test-secret-minimum-32-characters-long",
    });
    expect(verifyingAuth.options.emailAndPassword?.requireEmailVerification).toBe(true);
  });

  it("should NOT require email verification when Resend is absent", () => {
    const noResendAuth = createAuth({ prisma, secret: "test-secret-minimum-32-characters-long" });
    expect(noResendAuth.options.emailAndPassword?.requireEmailVerification).toBe(false);
  });

  it("should have bearer token plugin enabled", () => {
    const plugins = auth.options.plugins || [];
    const hasBearerToken = plugins.some((plugin) => plugin.id === "bearer");
    expect(hasBearerToken).toBe(true);
  });

  it("should have username plugin enabled", () => {
    const plugins = auth.options.plugins || [];
    const hasUsername = plugins.some((plugin) => plugin.id === "username");
    expect(hasUsername).toBe(true);
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

  it("should have correct rate-limiting window and max", () => {
    expect(auth.options.rateLimit?.window).toBe(60);
    expect(auth.options.rateLimit?.max).toBe(100);
  });

  it("should enable rate limiting in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    // The rateLimit gate is `production && !CI` — GitHub Actions sets
    // CI=true on the runner, so we must clear it for the production path
    // to evaluate true under test.
    vi.stubEnv("CI", "");
    const prodAuth = createAuth({ prisma, secret: "test-secret-minimum-32-characters-long" });
    expect(prodAuth.options.rateLimit?.enabled).toBe(true);
  });

  it("should concat TRUSTED_ORIGINS env values with loopback defaults", () => {
    vi.stubEnv("TRUSTED_ORIGINS", "https://app.acme.com,https://api.acme.com");

    const envAuth = createAuth({ prisma, secret: "test-secret-minimum-32-characters-long" });
    const trusted = envAuth.options.trustedOrigins;
    expect(trusted).toContain("https://app.acme.com"); // env value
    expect(trusted).toContain("https://api.acme.com"); // env value
    expect(trusted).toContain("http://localhost:3000"); // loopback default
    expect(trusted).toContain("http://127.0.0.1:3000"); // loopback default
  });

  it("should always define reset password handler (no-op when resendApiKey is absent)", () => {
    // The handler is always wired so the Better Auth /forget-password
    // endpoint accepts the request — without an API key it just returns
    // without sending an email, which keeps the user-visible flow working
    // in dev/CI without email infra.
    expect(auth.options.emailAndPassword?.sendResetPassword).toBeDefined();
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

  it("should always define verification email handler (no-op when resendApiKey is absent)", () => {
    // Same reasoning as sendResetPassword above — endpoint accepts the
    // request, the actual send is gated on resendApiKey at call time.
    expect(auth.options.emailVerification?.sendVerificationEmail).toBeDefined();
  });

  it("should configure verification email when resendApiKey is provided", () => {
    const emailAuth = createAuth({
      prisma,
      resendApiKey: "re_test_key",
      secret: "test-secret-minimum-32-characters-long",
    });
    expect(emailAuth.options.emailVerification?.sendVerificationEmail).toBeDefined();
  });

  it("should have displayName as optional additional user field", () => {
    const displayName = auth.options.user?.additionalFields?.displayName;
    expect(displayName).toEqual({
      defaultValue: null,
      required: false,
      type: "string",
    });
  });
});
