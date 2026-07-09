import type { ReactElement } from "react";
import { render } from "react-email";
import { Resend } from "resend";
import { z } from "zod";

// Resend allows RFC 5322 "Name <email>" for from/reply-to; z.email() is bare-only so extract the bracketed address.
const senderAddressSchema = z.string().refine(
  (val) => {
    const wrapped = val.match(/^.+<(?<address>[^<>\s]+)>$/v);
    const email = wrapped?.groups?.address ?? val;
    return z.email().safeParse(email).success;
  },
  { message: "Must be a valid email or 'Display Name <email>' format" },
);

const recipientSchema = z.union([z.email(), z.array(z.email())]);

const tagSchema = z.object({
  name: z.string(),
  value: z.string(),
});

const emailConfigSchema = z.object({
  bcc: recipientSchema.optional(),
  cc: recipientSchema.optional(),
  from: senderAddressSchema.default("Acme <noreply@acme.com>"),
  replyTo: senderAddressSchema.optional(),
  subject: z.string(),
  tags: z.array(tagSchema).optional(),
  to: recipientSchema,
});

// z.input keeps from optional; z.infer would force every caller to pass it.
type EmailConfig = z.input<typeof emailConfigSchema>;

type SendEmailOptions = EmailConfig & {
  apiKey: string;
  defaultReplyTo?: string;
  template: ReactElement;
};

type PreparedEmailPayload = {
  bcc?: EmailConfig["bcc"];
  cc?: EmailConfig["cc"];
  from: string;
  html: string;
  replyTo?: string;
  subject: string;
  tags?: EmailConfig["tags"];
  text: string;
  to: EmailConfig["to"];
};

const sendEmail = async ({ apiKey, defaultReplyTo, template, ...config }: SendEmailOptions) => {
  if (!apiKey) {
    throw new Error("API key is required for sending emails");
  }

  try {
    const validatedConfig = emailConfigSchema.parse(config);
    const resend = new Resend(apiKey);

    const [html, text] = await Promise.all([
      render(template),
      render(template, { plainText: true }),
    ]);

    const result = await resend.emails.send({
      bcc: validatedConfig.bcc,
      cc: validatedConfig.cc,
      from: validatedConfig.from,
      html,
      replyTo: validatedConfig.replyTo || defaultReplyTo,
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

const sendBatchEmails = async (
  emails: Array<SendEmailOptions>,
  apiKey: string,
  defaultReplyTo?: string,
) => {
  if (!apiKey) {
    throw new Error("API key is required for sending emails");
  }

  if (emails.length > 100) {
    throw new Error("Batch size cannot exceed 100 emails");
  }

  try {
    const resend = new Resend(apiKey);

    const settledBatchData = await Promise.allSettled(
      emails.map(async ({ template, ...config }) => {
        const validatedConfig = emailConfigSchema.parse(config);
        const [html, text] = await Promise.all([
          render(template),
          render(template, { plainText: true }),
        ]);

        return {
          bcc: validatedConfig.bcc,
          cc: validatedConfig.cc,
          from: validatedConfig.from,
          html,
          replyTo: validatedConfig.replyTo || defaultReplyTo,
          subject: validatedConfig.subject,
          tags: validatedConfig.tags,
          text,
          to: validatedConfig.to,
        };
      }),
    );

    const batchData: Array<PreparedEmailPayload> = [];
    const rejectionReasons: Array<unknown> = [];
    const rejectionMessages: Array<string> = [];

    settledBatchData.forEach((result, index) => {
      if (result.status === "fulfilled") {
        batchData.push(result.value);
        return;
      }

      rejectionReasons.push(result.reason);

      const reason = result.reason instanceof Error ? result.reason.message : String(result.reason);
      rejectionMessages.push(`email index ${index}: ${reason}`);
    });

    if (rejectionReasons.length > 0) {
      throw new AggregateError(
        rejectionReasons,
        `Failed to prepare ${rejectionReasons.length} email(s): ${rejectionMessages.join("; ")}`,
      );
    }

    const result = await resend.batch.send(batchData);

    if (result.error) {
      throw new Error(
        `Resend failed to queue batch: ${result.error.name ?? "unknown_error"} - ${result.error.message ?? "No message"}`,
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
      error: error instanceof Error ? error.message : "Failed to send batch emails",
      success: false,
    };
  }
};

const previewEmail = async (template: ReactElement) => {
  const [html, text] = await Promise.all([render(template), render(template, { plainText: true })]);

  return {
    html,
    text,
  };
};

export { sendEmail, sendBatchEmails, previewEmail };
