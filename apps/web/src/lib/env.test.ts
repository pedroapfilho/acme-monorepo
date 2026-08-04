import { afterEach, describe, expect, it, vi } from "vitest";

const VALID_ENV = {
  BETTER_AUTH_SECRET: "a".repeat(32),
  FROM_EMAIL: "noreply@acme.com",
  RESEND_API_KEY: "re_test",
};

// The module caches on first read, so every case needs a fresh import.
const loadGetEnv = async (overrides: Record<string, string | undefined> = {}) => {
  vi.resetModules();
  for (const [key, value] of Object.entries({ ...VALID_ENV, ...overrides })) {
    vi.stubEnv(key, value);
  }
  const { getEnv } = await import("./env");
  return getEnv;
};

describe("getEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the parsed environment", async () => {
    const getEnv = await loadGetEnv();

    expect(getEnv()).toMatchObject({
      BETTER_AUTH_SECRET: VALID_ENV.BETTER_AUTH_SECRET,
      FROM_EMAIL: "noreply@acme.com",
      RESEND_API_KEY: "re_test",
    });
  });

  it("caches the result across reads", async () => {
    const getEnv = await loadGetEnv();

    expect(getEnv()).toBe(getEnv());
  });

  it("treats RESEND_API_KEY as optional", async () => {
    const getEnv = await loadGetEnv({ RESEND_API_KEY: undefined });

    expect(getEnv().RESEND_API_KEY).toBeUndefined();
  });

  it("throws when FROM_EMAIL is missing", async () => {
    const getEnv = await loadGetEnv({ FROM_EMAIL: undefined });

    expect(() => getEnv()).toThrow(/FROM_EMAIL/v);
  });

  it("throws when FROM_EMAIL is not an address", async () => {
    const getEnv = await loadGetEnv({ FROM_EMAIL: "noreply@acme" });

    expect(() => getEnv()).toThrow(/FROM_EMAIL/v);
  });

  it("accepts the display-name sender form the mailer allows", async () => {
    const getEnv = await loadGetEnv({ FROM_EMAIL: "Acme <noreply@acme.com>" });

    expect(getEnv().FROM_EMAIL).toBe("Acme <noreply@acme.com>");
  });

  it("throws when BETTER_AUTH_SECRET is too short", async () => {
    const getEnv = await loadGetEnv({ BETTER_AUTH_SECRET: "short" });

    expect(() => getEnv()).toThrow(/BETTER_AUTH_SECRET/v);
  });
});
