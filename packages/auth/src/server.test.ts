import { prisma } from "@repo/db";
import { beforeAll, describe, expect, it } from "vitest";

import { createAuth } from "./server";
import type { AuthConfig } from "./server";

type Plugin = NonNullable<AuthConfig["extraPlugins"]>[number];

const baseConfig = {
  allowedHosts: ["**.localhost"],
  prisma,
  secret: "test-secret-minimum-32-characters-long",
} satisfies AuthConfig;

describe("Auth Server Configuration", () => {
  let auth: ReturnType<typeof createAuth>;

  beforeAll(() => {
    auth = createAuth(baseConfig);
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

  it("should leave secure cookies off unless the caller opts in", () => {
    expect(auth.options.advanced?.useSecureCookies).toBe(false);
    expect(auth.options.advanced?.defaultCookieAttributes?.httpOnly).toBe(true);
    expect(auth.options.advanced?.defaultCookieAttributes?.sameSite).toBe("lax");
  });

  it("should set useSecureCookies from config", () => {
    const httpsAuth = createAuth({ ...baseConfig, useSecureCookies: true });
    expect(httpsAuth.options.advanced?.useSecureCookies).toBe(true);
  });

  it("should configure dynamic baseURL with protocol auto", () => {
    const baseURL = auth.options.baseURL;
    if (typeof baseURL !== "object" || baseURL === null) {
      throw new Error("expected dynamic baseURL object");
    }
    expect(baseURL.protocol).toBe("auto");
    expect(baseURL.fallback).toBe("http://localhost:4000");
  });

  it("should take baseURL.allowedHosts from config", () => {
    const hostAuth = createAuth({
      ...baseConfig,
      allowedHosts: ["**.localhost", "acme.com", "*.vercel.app"],
    });
    const baseURL = hostAuth.options.baseURL;
    if (typeof baseURL !== "object" || baseURL === null) {
      throw new Error("expected dynamic baseURL object");
    }
    expect(baseURL.allowedHosts).toEqual(
      expect.arrayContaining(["**.localhost", "acme.com", "*.vercel.app"]),
    );
  });

  it("should require email verification when Resend is configured", () => {
    const verifyingAuth = createAuth({ ...baseConfig, resendApiKey: "re_test_key" });
    expect(verifyingAuth.options.emailAndPassword?.requireEmailVerification).toBe(true);
  });

  it("should NOT require email verification when Resend is absent", () => {
    const noResendAuth = createAuth(baseConfig);
    expect(noResendAuth.options.emailAndPassword?.requireEmailVerification).toBe(false);
  });

  it("should have bearer token plugin enabled", () => {
    const plugins = auth.options.plugins ?? [];
    const hasBearerToken = plugins.some((plugin) => plugin.id === "bearer");
    expect(hasBearerToken).toBe(true);
  });

  it("should have username plugin enabled", () => {
    const plugins = auth.options.plugins ?? [];
    const hasUsername = plugins.some((plugin) => plugin.id === "username");
    expect(hasUsername).toBe(true);
  });

  it("should have account linking enabled", () => {
    expect(auth.options.account?.accountLinking?.enabled).toBe(true);
  });

  it("should default to no trusted origins", () => {
    expect(auth.options.trustedOrigins).toEqual([]);
  });

  it("should use database storage for rate limiting", () => {
    expect(auth.options.rateLimit?.storage).toBe("database");
  });

  it("should have correct rate-limiting window and max", () => {
    expect(auth.options.rateLimit?.window).toBe(60);
    expect(auth.options.rateLimit?.max).toBe(100);
  });

  it("should leave rate limiting off unless the caller opts in", () => {
    expect(auth.options.rateLimit?.enabled).toBe(false);
  });

  it("should enable rate limiting from config", () => {
    const limitedAuth = createAuth({ ...baseConfig, rateLimitEnabled: true });
    expect(limitedAuth.options.rateLimit?.enabled).toBe(true);
  });

  it("should take trustedOrigins from config", () => {
    const originAuth = createAuth({
      ...baseConfig,
      trustedOrigins: ["https://app.acme.com", "http://localhost:3000"],
    });
    const trusted = originAuth.options.trustedOrigins;
    expect(trusted).toContain("https://app.acme.com");
    expect(trusted).toContain("http://localhost:3000");
  });

  it("should always define reset password handler (no-op when resendApiKey is absent)", () => {
    expect(auth.options.emailAndPassword?.sendResetPassword).toBeDefined();
  });

  it("should configure reset password email when resendApiKey is provided", () => {
    const emailAuth = createAuth({ ...baseConfig, resendApiKey: "re_test_key" });
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
    const extendedAuth = createAuth({ ...baseConfig, extraPlugins: [mockPlugin] });
    const plugins = extendedAuth.options.plugins ?? [];
    expect(plugins.some((p) => p.id === "test-plugin")).toBe(true);
  });

  it("should always define verification email handler (no-op when resendApiKey is absent)", () => {
    expect(auth.options.emailVerification?.sendVerificationEmail).toBeDefined();
  });

  it("should configure verification email when resendApiKey is provided", () => {
    const emailAuth = createAuth({ ...baseConfig, resendApiKey: "re_test_key" });
    expect(emailAuth.options.emailVerification?.sendVerificationEmail).toBeDefined();
  });

  it("sets emailVerification.callbackURL to the app root", () => {
    expect(auth.options.emailVerification?.callbackURL).toBe("/");
  });

  it("enables autoSignInAfterVerification so the verification link is the login", () => {
    expect(auth.options.emailVerification?.autoSignInAfterVerification).toBe(true);
  });

  it("re-sends the verification email on unverified sign-in attempts", () => {
    expect(auth.options.emailVerification?.sendOnSignIn).toBe(true);
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
