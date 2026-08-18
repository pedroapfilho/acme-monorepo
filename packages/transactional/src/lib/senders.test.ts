import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSendEmail } from "./send-email";
import type { SendEmailTransport } from "./send-email";
import { createTransactionalEmailSender } from "./senders";
import type { TransactionalEmail } from "./senders";

const sendMock = vi.fn<SendEmailTransport>();
const sendTransactionalEmail = createTransactionalEmailSender(createSendEmail(sendMock));

const config = { apiKey: "re_test", from: "Acme <noreply@acme.com>" };

describe("sendTransactionalEmail dispatch", () => {
  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "test" }, error: null, headers: null });
  });

  const cases: Array<{
    email: TransactionalEmail;
    htmlMarker: string;
    subject: string;
    to: string;
  }> = [
    {
      email: {
        type: "welcome",
        userEmail: "new@acme.com",
        userId: "user_1",
        username: "Ada",
        verificationUrl: "https://acme.com/verify",
      },
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
    "routes $email.type to subject, recipient, tags, and rendered template",
    async ({ email, htmlMarker, subject, to }) => {
      const result = await sendTransactionalEmail(email, config);

      expect(result.ok).toBe(true);
      expect(sendMock).toHaveBeenCalledOnce();
      const payload = sendMock.mock.calls[0]?.[1];
      expect(payload).toBeDefined();
      if (payload === undefined) {
        throw new Error("Email payload was not recorded");
      }
      expect(payload.subject).toBe(subject);
      expect(payload.to).toBe(to);
      expect(payload.tags).toEqual([
        { name: "type", value: email.type },
        { name: "userId", value: email.userId },
      ]);
      expect(typeof payload.html).toBe("string");
      expect(payload.html).toContain(htmlMarker);
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

    expect(sendMock.mock.calls[0]?.[1]?.subject).toBe("Welcome to Acme! Please verify your email");
  });
});
