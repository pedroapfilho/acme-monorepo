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

  it("starts when Resend, the sender and the web app URL are configured", async () => {
    const getAuth = await loadGetAuth();

    expect(() => getAuth()).not.toThrow();
  });

  it("starts without RESEND_API_KEY when mail goes to the outbox", async () => {
    const getAuth = await loadGetAuth({ MAIL_TRANSPORT: "outbox", RESEND_API_KEY: undefined });

    expect(() => getAuth()).not.toThrow();
  });

  it.each([undefined, ""])("refuses to start with the RESEND_API_KEY %j", async (key) => {
    const getAuth = await loadGetAuth({ RESEND_API_KEY: key });

    expect(() => getAuth()).toThrow("RESEND_API_KEY is required unless MAIL_TRANSPORT=outbox");
  });

  it("refuses a FROM_EMAIL that is not an address", async () => {
    const getAuth = await loadGetAuth({ FROM_EMAIL: "noreply@acme" });

    expect(() => getAuth()).toThrow(/valid email/v);
  });

  it("refuses to start without WEB_APP_URL", async () => {
    const getAuth = await loadGetAuth({ WEB_APP_URL: undefined });

    expect(() => getAuth()).toThrow(/WEB_APP_URL/v);
  });
});
