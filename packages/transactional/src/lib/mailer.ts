import * as React from "react";
import { render } from "react-email";
import { Resend } from "resend";
import type { CreateEmailOptions, CreateEmailResponse } from "resend";

import { ChangeEmail } from "../emails/change-email";
import { PasswordResetEmail } from "../emails/password-reset";
import { SignUpAttemptEmail } from "../emails/sign-up-attempt";
import { WelcomeEmail } from "../emails/welcome";

import { senderAddressSchema } from "./sender-address";

type WelcomePayload = {
  userEmail: string;
  userId: string;
  username?: string;
  verificationUrl: string;
};

type SignUpAttemptPayload = {
  resetPasswordUrl: string;
  signInUrl: string;
  userEmail: string;
  userId: string;
  username?: string;
};

type PasswordResetPayload = {
  browserInfo?: string;
  ipAddress?: string;
  resetUrl: string;
  userEmail: string;
  userId: string;
  username?: string;
};

type ChangeEmailPayload = {
  changeUrl: string;
  currentEmail: string;
  newEmail: string;
  userId: string;
  username?: string;
};

type TransactionalEmail =
  | ({ type: "welcome" } & WelcomePayload)
  | ({ type: "sign-up-attempt" } & SignUpAttemptPayload)
  | ({ type: "password-reset" } & PasswordResetPayload)
  | ({ type: "change-email-confirmation" } & ChangeEmailPayload);

type DeliveryResult = { ok: true } | { error: string; ok: false };

type Mailer = (email: TransactionalEmail) => Promise<DeliveryResult>;

type ResendSend = (payload: CreateEmailOptions) => Promise<CreateEmailResponse>;

type EmailBuild = { subject: string; template: React.ReactElement; to: string };

const buildEmail = (email: TransactionalEmail): EmailBuild => {
  switch (email.type) {
    case "welcome": {
      const greetingName =
        email.username !== undefined && email.username !== "" ? `, ${email.username}` : "";
      return {
        subject: `Welcome to Acme${greetingName}! Please verify your email`,
        template: React.createElement(WelcomeEmail, {
          userEmail: email.userEmail,
          username: email.username,
          verificationUrl: email.verificationUrl,
        }),
        to: email.userEmail,
      };
    }
    case "sign-up-attempt": {
      return {
        subject: "Sign-up attempt with your Acme account",
        template: React.createElement(SignUpAttemptEmail, {
          resetPasswordUrl: email.resetPasswordUrl,
          signInUrl: email.signInUrl,
          userEmail: email.userEmail,
          username: email.username,
        }),
        to: email.userEmail,
      };
    }
    case "password-reset": {
      return {
        subject: "Reset your Acme password",
        template: React.createElement(PasswordResetEmail, {
          browserInfo: email.browserInfo,
          ipAddress: email.ipAddress,
          resetUrl: email.resetUrl,
          userEmail: email.userEmail,
          username: email.username,
        }),
        to: email.userEmail,
      };
    }
    case "change-email-confirmation": {
      return {
        subject: "Confirm change of your Acme account email",
        template: React.createElement(ChangeEmail, {
          changeUrl: email.changeUrl,
          currentEmail: email.currentEmail,
          newEmail: email.newEmail,
          username: email.username,
        }),
        to: email.currentEmail,
      };
    }
    default: {
      const unhandled: never = email;
      throw new Error(`Unhandled transactional email: ${String(unhandled)}`);
    }
  }
};

const resendSend = (apiKey: string): ResendSend => {
  const resend = new Resend(apiKey);
  return (payload) => resend.emails.send(payload);
};

// A malformed sender is a configuration error and throws here; delivery failures are results the caller decides how to surface.
const createResendMailer = (
  { apiKey, from }: { apiKey: string; from: string },
  send: ResendSend = resendSend(apiKey),
): Mailer => {
  const sender = senderAddressSchema.parse(from);

  return async (email) => {
    const { subject, template, to } = buildEmail(email);
    try {
      const [html, text] = await Promise.all([
        render(template),
        render(template, { plainText: true }),
      ]);
      const { error } = await send({
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
          error: `Resend failed to queue email: ${error.name} - ${error.message}`,
          ok: false,
        };
      }
      return { ok: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to send email", ok: false };
    }
  };
};

export { createResendMailer };
export type { Mailer, ResendSend, TransactionalEmail };
