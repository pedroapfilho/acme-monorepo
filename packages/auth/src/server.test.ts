import { log } from "@repo/observability";
import type { Mailer, TransactionalEmail } from "@repo/transactional";
import { memoryAdapter } from "better-auth/adapters/memory";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createAuth } from "./server";
import type { Auth, AuthConfig } from "./server";

const WEB_APP_URL = "https://app.acme.test";
const PASSWORD = "correct horse battery";

type CapturingMailer = { mailer: Mailer; sent: Array<TransactionalEmail> };

const capturingMailer = (failing: Array<TransactionalEmail["type"]> = []): CapturingMailer => {
  const sent: Array<TransactionalEmail> = [];

  const mailer: Mailer = (email) => {
    sent.push(email);

    return Promise.resolve(
      failing.includes(email.type) ? { error: "quota exceeded", ok: false } : { ok: true },
    );
  };

  return { mailer, sent };
};

const testAuth = ({ mailer, ...config }: Partial<AuthConfig> & { mailer?: Mailer } = {}) =>
  createAuth({
    allowedHosts: ["**.localhost"],
    database: memoryAdapter({ account: [], session: [], user: [], verification: [] }),
    email: mailer && {
      mailer,
      resetPasswordUrl: `${WEB_APP_URL}/recover`,
      signInUrl: `${WEB_APP_URL}/login`,
    },
    secret: "test-secret-minimum-32-characters-long",
    ...config,
  });

const signUp = (auth: Auth, email = "ada@acme.test", password = PASSWORD) =>
  auth.api.signUpEmail({ body: { email, name: "Ada", password } });

const sentOfType = <T extends TransactionalEmail["type"]>(
  sent: Array<TransactionalEmail>,
  type: T,
): Array<Extract<TransactionalEmail, { type: T }>> =>
  sent.filter((email): email is Extract<TransactionalEmail, { type: T }> => email.type === type);

const signedInCookie = async (auth: Auth, email: string) => {
  const { headers } = await auth.api.signInEmail({
    body: { email, password: PASSWORD },
    returnHeaders: true,
  });

  return headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
};

const verify = async (auth: Auth, welcome: { verificationUrl: string }) => {
  const token = new URL(welcome.verificationUrl).searchParams.get("token") ?? "";
  await auth.api.verifyEmail({ query: { token } });
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createAuth with a mailer", () => {
  it("reports email delivery as available", () => {
    expect(testAuth({ mailer: capturingMailer().mailer }).canSendEmail).toBe(true);
  });

  it("emails a verification link on sign-up and withholds the session until it is used", async () => {
    const { mailer, sent } = capturingMailer();
    const auth = testAuth({ mailer });

    const result = await signUp(auth);

    expect(result.token).toBeNull();
    expect(sent).toEqual([
      {
        linkLifetimeHours: 1,
        name: "Ada",
        type: "welcome",
        userEmail: "ada@acme.test",
        userId: result.user.id,
        verificationUrl: expect.stringMatching(/\/api\/auth\/verify-email\?token=/v),
      },
    ]);
  });

  it("refuses an unverified sign-in and sends a fresh verification link", async () => {
    const { mailer, sent } = capturingMailer();
    const auth = testAuth({ mailer });
    await signUp(auth);

    await expect(signedInCookie(auth, "ada@acme.test")).rejects.toThrow(/not verified/iv);

    expect(sentOfType(sent, "welcome")).toHaveLength(2);
  });

  it("tells the account holder about a repeated sign-up with the links it was given", async () => {
    const { mailer, sent } = capturingMailer();
    const auth = testAuth({ mailer });
    const first = await signUp(auth);

    const repeat = await signUp(auth, "ada@acme.test", "another long password");

    expect(repeat.token).toBeNull();
    expect(repeat.user.email).toBe("ada@acme.test");
    expect(sentOfType(sent, "sign-up-attempt")).toEqual([
      {
        name: "Ada",
        resetPasswordUrl: `${WEB_APP_URL}/recover`,
        signInUrl: `${WEB_APP_URL}/login`,
        type: "sign-up-attempt",
        userEmail: "ada@acme.test",
        userId: first.user.id,
      },
    ]);
  });

  it("answers a repeated sign-up normally and logs the failure when the notice cannot be sent", async () => {
    const logError = vi.spyOn(log, "error");
    const auth = testAuth({ mailer: capturingMailer(["sign-up-attempt"]).mailer });
    await signUp(auth);

    const repeat = await signUp(auth, "ada@acme.test", "another long password");

    expect(repeat.token).toBeNull();
    expect(repeat.user.email).toBe("ada@acme.test");
    expect(logError).toHaveBeenCalledWith({
      error: "quota exceeded",
      message: "Auth: failed to send sign-up attempt email",
    });
  });

  it("surfaces a failed verification resend to the caller", async () => {
    const auth = testAuth({ mailer: capturingMailer(["welcome"]).mailer });
    await signUp(auth);

    await expect(
      auth.api.sendVerificationEmail({ body: { email: "ada@acme.test" } }),
    ).rejects.toThrow("Failed to send verification email: quota exceeded");
  });

  it("emails a password reset link", async () => {
    const { mailer, sent } = capturingMailer();
    const auth = testAuth({ mailer });
    const { user } = await signUp(auth);

    await auth.api.requestPasswordReset({
      body: { email: "ada@acme.test", redirectTo: "/reset-password" },
    });

    expect(sentOfType(sent, "password-reset")).toEqual([
      {
        linkLifetimeHours: 1,
        name: "Ada",
        resetUrl: expect.stringMatching(
          /\/api\/auth\/reset-password\/\w+\?callbackURL=%2Freset-password$/v,
        ),
        type: "password-reset",
        userEmail: "ada@acme.test",
        userId: user.id,
      },
    ]);
  });

  it("asks the current address to confirm an email change", async () => {
    const { mailer, sent } = capturingMailer();
    const auth = testAuth({ mailer });
    const { user } = await signUp(auth);
    const [welcome] = sentOfType(sent, "welcome");

    if (welcome === undefined) {
      throw new Error("sign-up sent no verification email");
    }

    await verify(auth, welcome);
    const cookie = await signedInCookie(auth, "ada@acme.test");

    await auth.api.changeEmail({
      body: { callbackURL: "/dashboard/settings", newEmail: "lovelace@acme.test" },
      headers: new Headers({ cookie }),
    });

    expect(sentOfType(sent, "change-email-confirmation")).toEqual([
      {
        changeUrl: expect.stringMatching(
          /\/api\/auth\/verify-email\?token=.+&callbackURL=%2Fdashboard%2Fsettings$/v,
        ),
        currentEmail: "ada@acme.test",
        linkLifetimeHours: 1,
        name: "Ada",
        newEmail: "lovelace@acme.test",
        type: "change-email-confirmation",
        userId: user.id,
      },
    ]);
  });
});

describe("createAuth without a mailer", () => {
  it("reports email delivery as unavailable", () => {
    expect(testAuth().canSendEmail).toBe(false);
  });

  it("signs the user in on sign-up without asking for verification", async () => {
    const result = await signUp(testAuth());

    expect(result.token).toEqual(expect.any(String));
  });

  it("answers a password reset request without sending anything", async () => {
    const auth = testAuth();
    await signUp(auth);

    await expect(
      auth.api.requestPasswordReset({ body: { email: "ada@acme.test" } }),
    ).resolves.toMatchObject({ status: true });
  });
});

describe("createAuth credentials and sessions", () => {
  it.each(["Al", "A".repeat(33)])("rejects the sign-up name %s", async (name) => {
    const auth = testAuth();

    await expect(
      auth.api.signUpEmail({ body: { email: "ada@acme.test", name, password: PASSWORD } }),
    ).rejects.toThrow(/Name must be at/v);
  });

  it("rejects a profile update to a name outside the policy and keeps the old one", async () => {
    const auth = testAuth();
    await signUp(auth);
    const headers = new Headers({ cookie: await signedInCookie(auth, "ada@acme.test") });

    await expect(auth.api.updateUser({ body: { name: "Al" }, headers })).rejects.toThrow(
      "Name must be at least 3 characters",
    );

    const session = await auth.api.getSession({ headers });
    expect(session?.user.name).toBe("Ada");
  });

  it("rejects passwords shorter than 12 characters", async () => {
    await expect(signUp(testAuth(), "ada@acme.test", "elevenchars")).rejects.toThrow(
      /password too short/iv,
    );
  });

  it("issues acme-prefixed session cookies that last 7 days", async () => {
    const auth = testAuth();
    await signUp(auth);

    const cookie = await signedInCookie(auth, "ada@acme.test");
    const session = await auth.api.getSession({ headers: new Headers({ cookie }) });

    expect(cookie).toMatch(/^acme\.session_token=/v);
    expect(cookie.split("=")[0]).toBe(auth.sessionCookieName);
    const lifetime = (session?.session.expiresAt.getTime() ?? 0) - Date.now();
    expect(lifetime).toBeGreaterThan(60 * 60 * 24 * 7 * 1000 - 60_000);
    expect(lifetime).toBeLessThanOrEqual(60 * 60 * 24 * 7 * 1000);
  });

  it("prefixes cookies as secure when asked to", async () => {
    const auth = testAuth({ useSecureCookies: true });
    await signUp(auth);

    const cookie = await signedInCookie(auth, "ada@acme.test");

    expect(cookie).toMatch(/^__Secure-acme\.session_token=/v);
    expect(cookie.split("=")[0]).toBe(auth.sessionCookieName);
  });
});
