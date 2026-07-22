import * as React from "react";

import { ChangeEmail } from "../emails/change-email";
import { PasswordResetEmail } from "../emails/password-reset";
import { SignUpAttemptEmail } from "../emails/sign-up-attempt";
import { WelcomeEmail } from "../emails/welcome";

import { sendEmail } from "./send-email";

type MailerConfig = {
  apiKey: string;
  defaultReplyTo?: string;
  from?: string;
};

const DEFAULT_FROM = "Acme <noreply@acme.com>";

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

type EmailBuild = { subject: string; template: React.ReactElement; to: string };

// Switch dispatch narrows each case to its payload, so no per-branch cast is needed.
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
        // Consent to current email; sendVerificationEmail handles new-email verification.
        to: email.currentEmail,
      };
    }
    default: {
      // Compile-time exhaustiveness: a new email type not handled above fails this assignment.
      const unhandled: never = email;
      throw new Error(`Unhandled transactional email: ${String(unhandled)}`);
    }
  }
};

const sendTransactionalEmail = async (email: TransactionalEmail, config: MailerConfig) => {
  const { subject, template, to } = buildEmail(email);
  const from = config.from !== undefined && config.from !== "" ? config.from : DEFAULT_FROM;
  const result = await sendEmail({
    apiKey: config.apiKey,
    defaultReplyTo: config.defaultReplyTo,
    from,
    subject,
    tags: [
      { name: "type", value: email.type },
      { name: "userId", value: email.userId },
    ],
    template,
    to,
  });
  return result;
};

export type { MailerConfig, TransactionalEmail };
export { sendTransactionalEmail };
