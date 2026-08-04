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

const sendEmail = async ({ apiKey, template, ...config }: SendEmailOptions) => {
  if (!apiKey) {
    throw new Error("API key is required for sending emails");
  }

  try {
    const validatedConfig = emailConfigSchema.parse(config);
    const { html, text } = await renderTemplate(template);

    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
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
      throw new Error(
        `Resend failed to queue email: ${result.error.name ?? "unknown_error"} - ${result.error.message ?? "No message"}`,
      );
    }

    return {
      data: result.data,
      error: null,
      success: true,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to send email",
      success: false,
    };
  }
};

export { sendEmail };
