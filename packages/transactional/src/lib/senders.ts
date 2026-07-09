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

type TemplateBuilder<P> = (payload: P) => EmailBuild;

const TEMPLATES = {
  "change-email-confirmation": ({
    changeUrl,
    currentEmail,
    newEmail,
    username,
  }: ChangeEmailPayload) => ({
    subject: "Confirm change of your Acme account email",
    template: React.createElement(ChangeEmail, { changeUrl, currentEmail, newEmail, username }),
    // Consent to current email; sendVerificationEmail handles new-email verification.
    to: currentEmail,
  }),
  "password-reset": ({
    browserInfo,
    ipAddress,
    resetUrl,
    userEmail,
    username,
  }: PasswordResetPayload) => ({
    subject: "Reset your Acme password",
    template: React.createElement(PasswordResetEmail, {
      browserInfo,
      ipAddress,
      resetUrl,
      userEmail,
      username,
    }),
    to: userEmail,
  }),
  "sign-up-attempt": ({
    resetPasswordUrl,
    signInUrl,
    userEmail,
    username,
  }: SignUpAttemptPayload) => ({
    subject: "Sign-up attempt with your Acme account",
    template: React.createElement(SignUpAttemptEmail, {
      resetPasswordUrl,
      signInUrl,
      userEmail,
      username,
    }),
    to: userEmail,
  }),
  welcome: ({ userEmail, username, verificationUrl }: WelcomePayload) => ({
    subject: `Welcome to Acme${username ? `, ${username}` : ""}! Please verify your email`,
    template: React.createElement(WelcomeEmail, { userEmail, username, verificationUrl }),
    to: userEmail,
  }),
} satisfies {
  "change-email-confirmation": TemplateBuilder<ChangeEmailPayload>;
  "password-reset": TemplateBuilder<PasswordResetPayload>;
  "sign-up-attempt": TemplateBuilder<SignUpAttemptPayload>;
  welcome: TemplateBuilder<WelcomePayload>;
};

const sendTransactionalEmail = (email: TransactionalEmail, config: MailerConfig) => {
  const builder = TEMPLATES[email.type] as TemplateBuilder<typeof email>;
  const { subject, template, to } = builder(email);
  return sendEmail({
    apiKey: config.apiKey,
    defaultReplyTo: config.defaultReplyTo,
    from: config.from || DEFAULT_FROM,
    subject,
    tags: [
      { name: "type", value: email.type },
      { name: "userId", value: email.userId },
    ],
    template,
    to,
  });
};

export type { MailerConfig, TransactionalEmail };
export { sendTransactionalEmail };
