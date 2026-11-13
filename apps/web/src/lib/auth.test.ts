// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const MAIL_ENV = {
  BETTER_AUTH_SECRET: "a".repeat(32),
  DATABASE_URL: "postgresql://acme:acme123@localhost:5432/acme",
  FROM_EMAIL: "Acme <noreply@acme.com>",
  RESEND_API_KEY: "re_test",
  WEB_APP_URL: "https://acme.web.localhost",
};

const loadGetAuth = async (overrides: Record<string, string | undefined> = {}) => {
  vi.resetModules();

  for (const [key, value] of Object.entries({ ...MAIL_ENV, ...overrides })) {
    vi.stubEnv(key, value);
  }

  const { getAuth } = await import("./auth");

  return getAuth;
};

describe("getAuth", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sends email when Resend, the sender and the web app URL are configured", async () => {
    const getAuth = await loadGetAuth();

    expect(getAuth().canSendEmail).toBe(true);
  });

  it("refuses a FROM_EMAIL that is not an address", async () => {
    const getAuth = await loadGetAuth({ FROM_EMAIL: "noreply@acme" });

    expect(() => getAuth()).toThrow(/valid email/v);
  });

  it("refuses RESEND_API_KEY without WEB_APP_URL", async () => {
    const getAuth = await loadGetAuth({ WEB_APP_URL: undefined });

    expect(() => getAuth()).toThrow(/WEB_APP_URL/v);
  });

  it("starts without WEB_APP_URL when no mailer is configured", async () => {
    const getAuth = await loadGetAuth({ RESEND_API_KEY: undefined, WEB_APP_URL: undefined });

    expect(getAuth().canSendEmail).toBe(false);
  });
});
