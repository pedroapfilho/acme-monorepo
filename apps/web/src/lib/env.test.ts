import { afterEach, describe, expect, it, vi } from "vitest";

const VALID_ENV = {
  BETTER_AUTH_SECRET: "a".repeat(32),
  DATABASE_URL: "postgresql://acme:acme123@localhost:5432/acme",
  FROM_EMAIL: "noreply@acme.com",
  RESEND_API_KEY: "re_test",
};

const loadEnv = async (overrides: Record<string, string | undefined> = {}) => {
  vi.resetModules();

  for (const [key, value] of Object.entries({ ...VALID_ENV, ...overrides })) {
    vi.stubEnv(key, value);
  }

  return import("./env");
};

const loadGetEnv = async (overrides: Record<string, string | undefined> = {}) => {
  const { getEnv } = await loadEnv(overrides);

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

  it("leaves RESEND_API_KEY out when mail goes to the outbox", async () => {
    const getEnv = await loadGetEnv({ MAIL_TRANSPORT: "outbox", RESEND_API_KEY: undefined });

    expect(getEnv()).toMatchObject({ MAIL_TRANSPORT: "outbox" });
    expect(getEnv().RESEND_API_KEY).toBeUndefined();
  });

  it.each([undefined, ""])("throws when DATABASE_URL is %j", async (value) => {
    const getEnv = await loadGetEnv({ DATABASE_URL: value });

    expect(() => getEnv()).toThrow(/DATABASE_URL/v);
  });

  it("parses the variables the auth package owns", async () => {
    const getEnv = await loadGetEnv({
      TRUSTED_ORIGINS: "https://a.example.com, https://b.example.com",
      WEB_APP_URL: "https://web.example.com",
    });

    expect(getEnv()).toMatchObject({
      TRUSTED_ORIGINS: ["https://a.example.com", "https://b.example.com"],
      WEB_APP_URL: "https://web.example.com",
    });
  });

  it("throws when WEB_APP_URL is not a URL", async () => {
    const getEnv = await loadGetEnv({ WEB_APP_URL: "web.example.com" });

    expect(() => getEnv()).toThrow(/WEB_APP_URL/v);
  });

  it("throws when FROM_EMAIL is missing", async () => {
    const getEnv = await loadGetEnv({ FROM_EMAIL: undefined });

    expect(() => getEnv()).toThrow(/FROM_EMAIL/v);
  });

  it("throws when BETTER_AUTH_SECRET is too short", async () => {
    const getEnv = await loadGetEnv({ BETTER_AUTH_SECRET: "short" });

    expect(() => getEnv()).toThrow(/BETTER_AUTH_SECRET/v);
  });
});

describe("webAppUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads WEB_APP_URL without the variables the app needs to boot", async () => {
    const { webAppUrl } = await loadEnv({
      BETTER_AUTH_SECRET: undefined,
      DATABASE_URL: undefined,
      WEB_APP_URL: "https://web.example.com",
    });

    expect(webAppUrl()).toBe("https://web.example.com");
  });

  it("is undefined when WEB_APP_URL is unset", async () => {
    const { webAppUrl } = await loadEnv({ WEB_APP_URL: undefined });

    expect(webAppUrl()).toBeUndefined();
  });
});
