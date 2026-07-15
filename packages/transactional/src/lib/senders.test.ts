import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TransactionalEmail } from "./senders";

const sendMock = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

const { sendTransactionalEmail } = await import("./senders");

const config = { apiKey: "re_test" };

describe("sendTransactionalEmail dispatch", () => {
  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "test" }, error: null });
  });

  const cases: Array<{ email: TransactionalEmail; subject: string; to: string }> = [
    {
      email: {
        type: "welcome",
        userEmail: "new@acme.com",
        userId: "user_1",
        username: "Ada",
        verificationUrl: "https://acme.com/verify",
      },
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
      subject: "Sign-up attempt with your Acme account",
      to: "existing@acme.com",
    },
    {
      email: {
        resetUrl: "https://acme.com/reset",
        type: "password-reset",
        userEmail: "reset@acme.com",
        userId: "user_3",
      },
      subject: "Reset your Acme password",
      to: "reset@acme.com",
    },
    {
      email: {
        changeUrl: "https://acme.com/change",
        currentEmail: "current@acme.com",
        newEmail: "next@acme.com",
        type: "change-email-confirmation",
        userId: "user_4",
      },
      subject: "Confirm change of your Acme account email",
      // Confirmation goes to the current address, not the new one.
      to: "current@acme.com",
    },
  ];

  it.each(cases)(
    "routes $email.type to subject, recipient, and tags",
    async ({ email, subject, to }) => {
      const result = await sendTransactionalEmail(email, config);

      expect(result.success).toBe(true);
      expect(sendMock).toHaveBeenCalledOnce();
      const payload = sendMock.mock.calls[0][0];
      expect(payload.subject).toBe(subject);
      expect(payload.to).toBe(to);
      expect(payload.tags).toEqual([
        { name: "type", value: email.type },
        { name: "userId", value: email.userId },
      ]);
      expect(typeof payload.html).toBe("string");
      expect(payload.html.length).toBeGreaterThan(0);
    },
  );

  it("omits the username clause in the welcome subject when username is absent", async () => {
    await sendTransactionalEmail(
      {
        type: "welcome",
        userEmail: "anon@acme.com",
        userId: "user_5",
        verificationUrl: "https://acme.com/verify",
      },
      config,
    );

    expect(sendMock.mock.calls[0][0].subject).toBe("Welcome to Acme! Please verify your email");
  });
});
