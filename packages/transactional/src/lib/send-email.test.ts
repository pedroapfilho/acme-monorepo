import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSendEmail } from "./send-email";
import type { SendEmailTransport } from "./send-email";

const sendMock = vi.fn<SendEmailTransport>();
const sendEmail = createSendEmail(sendMock);

describe("sendEmail from validation", () => {
  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "test" }, error: null, headers: null });
  });

  const template = createElement("div", null, "hi");

  it('accepts "Display Name <email>" form in from', async () => {
    const result = await sendEmail({
      apiKey: "re_test",
      from: "Acme <noreply@acme.com>",
      subject: "x",
      template,
      to: "delivered+test@resend.dev",
    });

    expect(result.ok).toBe(true);
    expect(sendMock).toHaveBeenCalledOnce();
    expect(sendMock.mock.calls[0]?.[1]).toMatchObject({
      from: "Acme <noreply@acme.com>",
    });
  });

  it("accepts bare email in from", async () => {
    const result = await sendEmail({
      apiKey: "re_test",
      from: "noreply@acme.com",
      subject: "x",
      template,
      to: "delivered+test@resend.dev",
    });

    expect(result.ok).toBe(true);
  });

  it("rejects an empty from instead of substituting a default sender", async () => {
    await expect(
      sendEmail({
        apiKey: "re_test",
        from: "",
        subject: "x",
        template,
        to: "delivered+test@resend.dev",
      }),
    ).rejects.toThrow();

    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejects from values that are neither bare email nor wrapped form", async () => {
    await expect(
      sendEmail({
        apiKey: "re_test",
        from: "not-an-email",
        subject: "x",
        template,
        to: "delivered+test@resend.dev",
      }),
    ).rejects.toThrow();

    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns a failure result when Resend rejects the send", async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { message: "quota", name: "rate_limit_exceeded", statusCode: 429 },
      headers: null,
    });

    const result = await sendEmail({
      apiKey: "re_test",
      from: "noreply@acme.com",
      subject: "x",
      template,
      to: "delivered+test@resend.dev",
    });

    expect(result).toMatchObject({ ok: false });
    expect(result.ok ? "" : result.error).toContain("rate_limit");
  });
});
