import { afterEach, describe, expect, it, vi } from "vitest";

import { envAuthConfig, parseEnvList } from "./env-config";

describe("parseEnvList", () => {
  it("returns an empty list for missing input", () => {
    expect(parseEnvList(undefined)).toEqual([]);
    expect(parseEnvList("")).toEqual([]);
  });

  it("normalizes comma-separated input", () => {
    expect(parseEnvList(" a.com ,, b.com ")).toEqual(["a.com", "b.com"]);
  });
});

describe("envAuthConfig", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("includes local hosts and loopback origins", () => {
    const config = envAuthConfig();
    expect(config.allowedHosts).toEqual(
      expect.arrayContaining(["**.localhost", "localhost:*", "127.0.0.1:*"]),
    );
    expect(config.trustedOrigins).toEqual(
      expect.arrayContaining(["http://localhost:3000", "http://127.0.0.1:3000"]),
    );
  });

  it("includes configured hosts and explicit CORS origins", () => {
    vi.stubEnv("AUTH_ALLOWED_HOSTS", "example.com,*.example.com");
    vi.stubEnv("CORS_ORIGINS", "https://web.example.com,*");
    vi.stubEnv("TRUSTED_ORIGINS", "https://service.example.com");

    const config = envAuthConfig();
    expect(config.allowedHosts).toEqual(expect.arrayContaining(["example.com", "*.example.com"]));
    expect(config.trustedOrigins).toEqual(
      expect.arrayContaining(["https://web.example.com", "https://service.example.com"]),
    );
    expect(config.trustedOrigins).not.toContain("*");
  });

  it("includes product-specific hosts and origins", () => {
    const config = envAuthConfig({
      additionalAllowedHosts: ["desktop.example.com"],
      additionalTrustedOrigins: ["example-app:/"],
    });
    expect(config.allowedHosts).toContain("desktop.example.com");
    expect(config.trustedOrigins).toContain("example-app:/");
  });

  it("derives cookie security and domain from configuration", () => {
    vi.stubEnv("COOKIE_DOMAIN", " .example.com ");
    expect(envAuthConfig({ secureUrl: "https://web.example.com" })).toMatchObject({
      cookieDomain: ".example.com",
      useSecureCookies: true,
    });
    expect(envAuthConfig({ secureUrl: "http://localhost:3000" }).useSecureCookies).toBe(false);
  });

  it("enables rate limiting only in production outside CI", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CI", "");
    expect(envAuthConfig().rateLimitEnabled).toBe(true);
    vi.stubEnv("CI", "true");
    expect(envAuthConfig().rateLimitEnabled).toBe(false);
  });
});
