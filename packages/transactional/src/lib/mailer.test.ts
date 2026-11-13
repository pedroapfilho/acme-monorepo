import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Transport } from "../transport";

import { createMailer } from "./mailer";
import type { TransactionalEmail } from "./mailer";

const send = vi.fn<Transport>();

const mailerFrom = (from: string) => createMailer({ from, transport: send });

const welcome: TransactionalEmail = {
  linkLifetimeHours: 1,
  name: "Ada",
  type: "welcome",
  userEmail: "new@acme.com",
  userId: "user_1",
  verificationUrl: "https://acme.com/verify",
};

const sentPayload = () => {
  const payload = send.mock.calls[0]?.[0];

  if (payload === undefined) {
    throw new Error("The transport was not called");
  }

  return payload;
};

describe("createMailer", () => {
  beforeEach(() => {
    send.mockReset();
    send.mockResolvedValue({ data: { id: "test" }, error: null, headers: null });
  });

  const cases: Array<{
    email: TransactionalEmail;
    htmlMarker: string;
    subject: string;
    to: string;
  }> = [
    {
      email: welcome,
      htmlMarker: "https://acme.com/verify",
      subject: "Welcome to Acme, Ada! Please verify your email",
      to: "new@acme.com",
    },
    {
      email: {
        resetPasswordUrl: "https://acme.com/recover",
        signInUrl: "https://acme.com/login",
        type: "sign-up-attempt",
        userEmail: "existing@acme.com",
        userId: "user_2",
      },
      htmlMarker: "https://acme.com/login",
      subject: "Sign-up attempt with your Acme account",
      to: "existing@acme.com",
    },
    {
      email: {
        linkLifetimeHours: 1,
        resetUrl: "https://acme.com/reset",
        type: "password-reset",
        userEmail: "reset@acme.com",
        userId: "user_3",
      },
      htmlMarker: "https://acme.com/reset",
      subject: "Reset your Acme password",
      to: "reset@acme.com",
    },
    {
      email: {
        changeUrl: "https://acme.com/change",
        currentEmail: "current@acme.com",
        linkLifetimeHours: 1,
        newEmail: "next@acme.com",
        type: "change-email-confirmation",
        userId: "user_4",
      },
      htmlMarker: "https://acme.com/change",
      subject: "Confirm change of your Acme account email",
      to: "current@acme.com",
    },
  ];

  it.each(cases)(
    "sends $email.type with its subject, recipient, tags, and rendered link",
    async ({ email, htmlMarker, subject, to }) => {
      const result = await mailerFrom("Acme <noreply@acme.com>")(email);

      expect(result).toEqual({ ok: true });
      expect(send).toHaveBeenCalledOnce();
      const payload = sentPayload();
      expect(payload.subject).toBe(subject);
      expect(payload.to).toBe(to);
      expect(payload.tags).toEqual([
        { name: "type", value: email.type },
        { name: "userId", value: email.userId },
      ]);
      expect(payload.html).toContain(htmlMarker);
      expect(payload.text).toContain(htmlMarker);
    },
  );

  it.each([
    [1, "1 hour"],
    [24, "24 hours"],
  ])("states a %i-hour link lifetime as %s", async (linkLifetimeHours, phrase) => {
    await mailerFrom("noreply@acme.com")({ ...welcome, linkLifetimeHours });

    expect(sentPayload().text).toContain(`verification link expires in ${phrase}.`);
  });

  it("omits the name clause in the welcome subject when the name is absent", async () => {
    await mailerFrom("noreply@acme.com")({ ...welcome, name: undefined });

    expect(sentPayload().subject).toBe("Welcome to Acme! Please verify your email");
  });

  it.each(["Acme <noreply@acme.com>", "noreply@acme.com"])("sends from %s", async (from) => {
    await mailerFrom(from)(welcome);

    expect(sentPayload().from).toBe(from);
  });

  it.each(["", "not-an-email", "Acme <noreply@acme>"])(
    "refuses to build a mailer that sends from %j",
    (from) => {
      expect(() => mailerFrom(from)).toThrow(
        "Must be a valid email or 'Display Name <email>' format",
      );
    },
  );

  it("reports a rejected message as a failed delivery", async () => {
    send.mockResolvedValue({
      data: null,
      error: { message: "quota", name: "rate_limit_exceeded", statusCode: 429 },
      headers: null,
    });

    const result = await mailerFrom("noreply@acme.com")(welcome);

    expect(result).toEqual({
      error: "Failed to queue email: rate_limit_exceeded - quota",
      ok: false,
    });
  });

  it("reports a transport error as a failed delivery", async () => {
    send.mockRejectedValue(new Error("socket hang up"));

    const result = await mailerFrom("noreply@acme.com")(welcome);

    expect(result).toEqual({ error: "socket hang up", ok: false });
  });

  it("reports a template construction error as a failed delivery", async () => {
    const email: TransactionalEmail = {
      ...welcome,
      get name(): string {
        throw new Error("Template data unavailable");
      },
    };

    await expect(mailerFrom("noreply@acme.com")(email)).resolves.toEqual({
      error: "Template data unavailable",
      ok: false,
    });
    expect(send).not.toHaveBeenCalled();
  });
});
