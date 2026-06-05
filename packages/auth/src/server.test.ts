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

  it("should gate useSecureCookies on WEB_APP_URL being HTTPS", () => {
    // Without WEB_APP_URL → false. Browsers drop Secure cookies on plain HTTP.
    expect(auth.options.advanced?.useSecureCookies).toBe(false);
    expect(auth.options.advanced?.defaultCookieAttributes?.httpOnly).toBe(true);
    expect(auth.options.advanced?.defaultCookieAttributes?.sameSite).toBe("lax");
  });

  it("should set useSecureCookies when WEB_APP_URL is HTTPS", () => {
    vi.stubEnv("WEB_APP_URL", "https://acme.web.localhost");
    const httpsAuth = createAuth({ prisma, secret: "test-secret-minimum-32-characters-long" });
    expect(httpsAuth.options.advanced?.useSecureCookies).toBe(true);
  });

  it("should NOT set useSecureCookies when WEB_APP_URL is HTTP", () => {
    vi.stubEnv("WEB_APP_URL", "http://localhost:3000");
    const httpAuth = createAuth({ prisma, secret: "test-secret-minimum-32-characters-long" });
    expect(httpAuth.options.advanced?.useSecureCookies).toBe(false);
  });

  it("should configure dynamic baseURL with allowedHosts + protocol auto", () => {
    const baseURL = auth.options.baseURL;
    if (typeof baseURL !== "object" || baseURL === null) {
      throw new Error("expected dynamic baseURL object");
    }
    expect(baseURL.protocol).toBe("auto");
    expect(baseURL.allowedHosts).toEqual(
      expect.arrayContaining(["**.localhost", "localhost:*", "127.0.0.1:*"]),
    );
    expect(baseURL.fallback).toBe("http://localhost:4000");
  });

  it("should extend baseURL.allowedHosts from AUTH_ALLOWED_HOSTS env", () => {
    vi.stubEnv("AUTH_ALLOWED_HOSTS", "acme.com,*.acme.com,*.vercel.app");

    const envAuth = createAuth({ prisma, secret: "test-secret-minimum-32-characters-long" });
    const baseURL = envAuth.options.baseURL;
    if (typeof baseURL !== "object" || baseURL === null) {
      throw new Error("expected dynamic baseURL object");
    }
    expect(baseURL.allowedHosts).toEqual(
      expect.arrayContaining(["acme.com", "*.acme.com", "*.vercel.app"]),
    );
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
    // Gate is `production && !CI`; clear CI so the prod path evaluates true.
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

  it("sets emailVerification.callbackURL to /verify-email/success", () => {
    expect(auth.options.emailVerification?.callbackURL).toBe("/verify-email/success");
  });

  it("enables autoSignInAfterVerification so the verification link mints a session", () => {
    expect(auth.options.emailVerification?.autoSignInAfterVerification).toBe(true);
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
