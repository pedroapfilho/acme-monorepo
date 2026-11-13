import { canonicalUrl, canonicalUrls } from "@repo/portless-env/apps";
import { matchesHostPattern } from "better-auth";
import { describe, expect, it } from "vitest";

import { authEnv, envAuthConfig } from "./env-config";

const config = (
  source: Record<string, string> = {},
  options?: Parameters<typeof envAuthConfig>[1],
) => envAuthConfig(authEnv.parse(source), options);

describe("authEnv", () => {
  it("reads a comma-separated list, and an unset or empty one as no entry", () => {
    expect(authEnv.parse({ AUTH_ALLOWED_HOSTS: " a.com ,, b.com " }).AUTH_ALLOWED_HOSTS).toEqual([
      "a.com",
      "b.com",
    ]);
    expect(authEnv.parse({}).TRUSTED_ORIGINS).toEqual([]);
    expect(authEnv.parse({ TRUSTED_ORIGINS: "" }).TRUSTED_ORIGINS).toEqual([]);
  });

  it("falls back to the local origins when CORS_ORIGINS is unset, and to none when it is empty", () => {
    expect(authEnv.parse({}).CORS_ORIGINS).toEqual(canonicalUrls("CORS_ORIGINS"));
    expect(authEnv.parse({ CORS_ORIGINS: "" }).CORS_ORIGINS).toEqual([]);
  });

  it("reads an empty WEB_APP_URL as unset and rejects one that is not a URL", () => {
    expect(authEnv.parse({ WEB_APP_URL: "" }).WEB_APP_URL).toBeUndefined();
    expect(() => authEnv.parse({ WEB_APP_URL: "web.example.com" })).toThrow(
      "WEB_APP_URL must be a valid URL",
    );
  });
});

describe("envAuthConfig", () => {
  it("includes local hosts and loopback origins", () => {
    const { allowedHosts, trustedOrigins } = config();

    expect(allowedHosts).toEqual(
      expect.arrayContaining(["**.localhost", "**.localhost:*", "localhost:*", "127.0.0.1:*"]),
    );
    expect(trustedOrigins).toEqual(
      expect.arrayContaining(["http://localhost:3000", "http://127.0.0.1:3000"]),
    );
  });

  it("allows portless hosts on port 443 and on its unprivileged fallback port", () => {
    const { allowedHosts } = config();
    const { host } = new URL(canonicalUrl("web"));

    for (const candidate of [
      host,
      `${host}:1355`,
      `fix-styles.${host}`,
      `fix-styles.${host}:1355`,
      "localhost:3000",
      "127.0.0.1:4000",
    ]) {
      expect(allowedHosts.some((pattern) => matchesHostPattern(candidate, pattern))).toBe(true);
    }
  });

  it("includes configured hosts and CORS origins, without the wildcard", () => {
    const { allowedHosts, trustedOrigins } = config({
      AUTH_ALLOWED_HOSTS: "example.com,*.example.com",
      CORS_ORIGINS: "https://web.example.com,*",
      TRUSTED_ORIGINS: "https://service.example.com",
    });

    expect(allowedHosts).toEqual(expect.arrayContaining(["example.com", "*.example.com"]));
    expect(trustedOrigins).toEqual(
      expect.arrayContaining(["https://web.example.com", "https://service.example.com"]),
    );
    expect(trustedOrigins).not.toContain("*");
  });

  it("includes product-specific hosts and origins", () => {
    const { allowedHosts, trustedOrigins } = config(
      {},
      {
        additionalAllowedHosts: ["desktop.example.com"],
        additionalTrustedOrigins: ["example-app:/"],
      },
    );

    expect(allowedHosts).toContain("desktop.example.com");
    expect(trustedOrigins).toContain("example-app:/");
  });

  it("derives cookie security from secureUrl, then from WEB_APP_URL", () => {
    expect(config({}, { secureUrl: "https://web.example.com" }).useSecureCookies).toBe(true);
    expect(config({}, { secureUrl: "http://localhost:3000" }).useSecureCookies).toBe(false);
    expect(config({ WEB_APP_URL: "https://web.example.com" }).useSecureCookies).toBe(true);
    expect(config().useSecureCookies).toBe(false);
  });

  it("links back to the web app at WEB_APP_URL", () => {
    expect(config({ WEB_APP_URL: "https://web.example.com" }).webAppUrl).toBe(
      "https://web.example.com",
    );
    expect(config().webAppUrl).toBeUndefined();
  });

  it("limits auth requests in production unless AUTH_RATE_LIMIT is off", () => {
    expect(config({ NODE_ENV: "production" }).rateLimitEnabled).toBe(true);
    expect(config({ AUTH_RATE_LIMIT: "", NODE_ENV: "production" }).rateLimitEnabled).toBe(true);
    expect(config({ AUTH_RATE_LIMIT: "off", NODE_ENV: "production" }).rateLimitEnabled).toBe(false);
    expect(config({ NODE_ENV: "development" }).rateLimitEnabled).toBe(false);
    expect(() => authEnv.parse({ AUTH_RATE_LIMIT: "false" })).toThrow("AUTH_RATE_LIMIT");
  });
});
