import { randomUUID } from "node:crypto";

import { describe, expect, it } from "vitest";

import { createTransport, readOutbox } from "./transport";

const outbox = createTransport({ apiKey: undefined, transport: "outbox" });

const mailTo = (to: string) => ({
  from: "Acme <noreply@acme.com>",
  html: '<a href="https://acme.com/verify">Verify</a>',
  subject: "Verify your email",
  text: "Verify https://acme.com/verify",
  to,
});

describe("createTransport", () => {
  it("keeps an outbox message where a reader finds it", async () => {
    const mail = mailTo(`${randomUUID()}@acme.com`);
    const sinceMs = Date.now();

    const result = await outbox(mail);

    expect(result.error).toBeNull();
    expect(await readOutbox(sinceMs)).toContainEqual(mail);
  });

  it("reads only the messages written since the given time", async () => {
    const mail = mailTo(`${randomUUID()}@acme.com`);

    await outbox(mail);

    expect(await readOutbox(Date.now() + 60_000)).not.toContainEqual(mail);
  });

  it("rejects a message without an HTML body as a validation error", async () => {
    const { html: _html, ...textOnly } = mailTo(`${randomUUID()}@acme.com`);
    const sinceMs = Date.now();

    const result = await outbox(textOnly);

    expect(result.error).toMatchObject({ name: "validation_error", statusCode: 422 });
    expect(await readOutbox(sinceMs)).not.toContainEqual(expect.objectContaining(textOnly));
  });

  it.each([undefined, ""])("refuses to send through Resend with the API key %j", (apiKey) => {
    expect(() => createTransport({ apiKey, transport: undefined })).toThrow(
      "RESEND_API_KEY is required unless MAIL_TRANSPORT=outbox",
    );
  });
});
