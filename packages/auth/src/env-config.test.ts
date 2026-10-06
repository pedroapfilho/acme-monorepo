import { matchesHostPattern } from "better-auth";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_CORS_ORIGINS, envAuthConfig, parseEnvList } from "./env-config";

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
      expect.arrayContaining(["**.localhost", "**.localhost:*", "localhost:*", "127.0.0.1:*"]),
    );
    expect(config.trustedOrigins).toEqual(
      expect.arrayContaining(["http://localhost:3000", "http://127.0.0.1:3000"]),
    );
  });

  it("allows portless hosts on port 443 and on its unprivileged fallback port", () => {
    const { allowedHosts } = envAuthConfig();
    for (const host of ["acme.web.localhost", "acme.web.localhost:1355"]) {
      expect(allowedHosts.some((pattern) => matchesHostPattern(host, pattern))).toBe(true);
    }
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

  it("derives cookie security from configuration", () => {
    expect(envAuthConfig({ secureUrl: "https://web.example.com" }).useSecureCookies).toBe(true);
    expect(envAuthConfig({ secureUrl: "http://localhost:3000" }).useSecureCookies).toBe(false);
  });

  it("links back to the web app at WEB_APP_URL", () => {
    vi.stubEnv("WEB_APP_URL", "https://web.example.com");
    expect(envAuthConfig().webAppUrl).toBe("https://web.example.com");
    vi.stubEnv("WEB_APP_URL", "");
    expect(envAuthConfig().webAppUrl).toBeUndefined();
  });

  it("falls back to the shared default origins when CORS_ORIGINS is unset", () => {
    expect(envAuthConfig().trustedOrigins).toEqual(
      expect.arrayContaining([...DEFAULT_CORS_ORIGINS]),
    );
  });

  it("enables rate limiting only in production outside CI", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CI", "");
    expect(envAuthConfig().rateLimitEnabled).toBe(true);
    vi.stubEnv("CI", "true");
    expect(envAuthConfig().rateLimitEnabled).toBe(false);
  });
});
