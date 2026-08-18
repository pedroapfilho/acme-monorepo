import type { ReactElement } from "react";
import { render } from "react-email";
import { Resend } from "resend";
import { z } from "zod";

import { senderAddressSchema } from "./sender-address";

const recipientSchema = z.union([z.email(), z.array(z.email())]);

const tagSchema = z.object({
  name: z.string(),
  value: z.string(),
});

const emailConfigSchema = z.object({
  bcc: recipientSchema.optional(),
  cc: recipientSchema.optional(),
  from: senderAddressSchema,
  replyTo: senderAddressSchema.optional(),
  subject: z.string(),
  tags: z.array(tagSchema).optional(),
  to: recipientSchema,
});

type EmailConfig = z.infer<typeof emailConfigSchema>;

type SendEmailOptions = EmailConfig & {
  apiKey: string;
  template: ReactElement;
};

const renderTemplate = async (template: ReactElement) => {
  const [html, text] = await Promise.all([render(template), render(template, { plainText: true })]);
  return { html, text };
};

type ResendSendResponse = Awaited<ReturnType<Resend["emails"]["send"]>>;
type ResendSendOptions = Parameters<Resend["emails"]["send"]>[0];
type SendEmailTransport = (
  apiKey: string,
  options: ResendSendOptions,
) => Promise<ResendSendResponse>;

type SendEmailResult =
  | { data: ResendSendResponse["data"]; ok: true }
  | { error: string; ok: false };

// Config validation stays outside the try: a malformed sender or payload is a programmer error and
// must throw, not come back as a delivery failure the caller would retry or log as an outage.
const resendTransport: SendEmailTransport = (apiKey, options) => {
  const resend = new Resend(apiKey);
  return resend.emails.send(options);
};

const createSendEmail =
  (send: SendEmailTransport) =>
  async ({ apiKey, template, ...config }: SendEmailOptions): Promise<SendEmailResult> => {
    if (!apiKey) {
      throw new Error("API key is required for sending emails");
    }

    const validatedConfig = emailConfigSchema.parse(config);

    try {
      const { html, text } = await renderTemplate(template);

      const result = await send(apiKey, {
        bcc: validatedConfig.bcc,
        cc: validatedConfig.cc,
        from: validatedConfig.from,
        html,
        replyTo: validatedConfig.replyTo,
        subject: validatedConfig.subject,
        tags: validatedConfig.tags,
        text,
        to: validatedConfig.to,
      });

      if (result.error) {
        return {
          error: `Resend failed to queue email: ${result.error.name ?? "unknown_error"} - ${result.error.message ?? "No message"}`,
          ok: false,
        };
      }

      return { data: result.data, ok: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to send email",
        ok: false,
      };
    }
  };

const sendEmail = createSendEmail(resendTransport);

export { createSendEmail, sendEmail };
export type { SendEmailTransport };
