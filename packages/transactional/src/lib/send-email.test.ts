import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

const { sendEmail } = await import("./send-email");

describe("sendEmail from validation", () => {
  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "test" }, error: null });
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

    expect(result.success).toBe(true);
    expect(sendMock).toHaveBeenCalledOnce();
    expect(sendMock.mock.calls[0][0]).toMatchObject({
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

    expect(result.success).toBe(true);
  });

  it("rejects an empty from instead of substituting a default sender", async () => {
    const result = await sendEmail({
      apiKey: "re_test",
      from: "",
      subject: "x",
      template,
      to: "delivered+test@resend.dev",
    });

    expect(result.success).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejects from values that are neither bare email nor wrapped form", async () => {
    const result = await sendEmail({
      apiKey: "re_test",
      from: "not-an-email",
      subject: "x",
      template,
      to: "delivered+test@resend.dev",
    });

    expect(result.success).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
