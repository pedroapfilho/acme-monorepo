import * as React from "react";
import { render } from "react-email";

import { ChangeEmail } from "../emails/change-email";
import { PasswordResetEmail } from "../emails/password-reset";
import { SignUpAttemptEmail } from "../emails/sign-up-attempt";
import { WelcomeEmail } from "../emails/welcome";
import type { Transport } from "../transport";

import { senderAddressSchema } from "./sender-address";

type TransactionalEmail =
  | ({ type: "welcome"; userId: string } & React.ComponentProps<typeof WelcomeEmail>)
  | ({ type: "sign-up-attempt"; userId: string } & React.ComponentProps<typeof SignUpAttemptEmail>)
  | ({ type: "password-reset"; userId: string } & React.ComponentProps<typeof PasswordResetEmail>)
  | ({ type: "change-email-confirmation"; userId: string } & React.ComponentProps<
      typeof ChangeEmail
    >);

type DeliveryResult = { ok: true } | { error: string; ok: false };

type Mailer = (email: TransactionalEmail) => Promise<DeliveryResult>;

type EmailBuild = { subject: string; template: React.ReactElement; to: string };

const buildEmail = (email: TransactionalEmail): EmailBuild => {
  switch (email.type) {
    case "welcome": {
      const greetingName = email.name !== undefined && email.name !== "" ? `, ${email.name}` : "";

      return {
        subject: `Welcome to Acme${greetingName}! Please verify your email`,
        template: React.createElement(WelcomeEmail, email),
        to: email.userEmail,
      };
    }

    case "sign-up-attempt": {
      return {
        subject: "Sign-up attempt with your Acme account",
        template: React.createElement(SignUpAttemptEmail, email),
        to: email.userEmail,
      };
    }

    case "password-reset": {
      return {
        subject: "Reset your Acme password",
        template: React.createElement(PasswordResetEmail, email),
        to: email.userEmail,
      };
    }

    case "change-email-confirmation": {
      return {
        subject: "Confirm change of your Acme account email",
        template: React.createElement(ChangeEmail, email),
        to: email.currentEmail,
      };
    }

    default: {
      const unhandled: never = email;
      throw new Error(`Unhandled transactional email: ${String(unhandled)}`);
    }
  }
};

// A malformed sender is a configuration error and throws here; delivery failures are results the caller decides how to surface.
const createMailer = ({ from, transport }: { from: string; transport: Transport }): Mailer => {
  const sender = senderAddressSchema.parse(from);

  return async (email) => {
    try {
      const { subject, template, to } = buildEmail(email);

      const [html, text] = await Promise.all([
        render(template),
        render(template, { plainText: true }),
      ]);

      const { error } = await transport({
        from: sender,
        html,
        subject,
        tags: [
          { name: "type", value: email.type },
          { name: "userId", value: email.userId },
        ],
        text,
        to,
      });

      if (error) {
        return {
          error: `Failed to queue email: ${error.name} - ${error.message}`,
          ok: false,
        };
      }

      return { ok: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to send email", ok: false };
    }
  };
};

export { createMailer };

export type { Mailer, TransactionalEmail };
