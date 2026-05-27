import * as React from "react";

import { ChangeEmail } from "../emails/change-email";
import { PasswordResetEmail } from "../emails/password-reset";
import { SignUpAttemptEmail } from "../emails/sign-up-attempt";
import { WelcomeEmail } from "../emails/welcome";

import { sendEmail } from "./send-email";

type EmailConfig = {
  apiKey: string;
  defaultReplyTo?: string;
  from?: string;
};

const DEFAULT_FROM = "Acme <noreply@acme.com>";

// These wrappers return `sendEmail`'s promise directly. Keeping them sync
// avoids a useless extra microtask; callers `await` them either way.
const sendWelcomeEmail = (
  {
    userEmail,
    userId,
    username,
    verificationUrl,
  }: {
    userEmail: string;
    userId: string;
    username?: string;
    verificationUrl: string;
  },
  config: EmailConfig,
) => {
  return sendEmail({
    apiKey: config.apiKey,
    defaultReplyTo: config.defaultReplyTo,
    from: config.from || DEFAULT_FROM,
    subject: `Welcome to Acme${username ? `, ${username}` : ""}! Please verify your email`,
    tags: [
      { name: "type", value: "welcome" },
      { name: "userId", value: userId },
    ],
    template: React.createElement(WelcomeEmail, {
      userEmail,
      username,
      verificationUrl,
    }),
    to: userEmail,
  });
};

const sendSignUpAttemptEmail = (
  {
    resetPasswordUrl,
    signInUrl,
    userEmail,
    userId,
    username,
  }: {
    resetPasswordUrl: string;
    signInUrl: string;
    userEmail: string;
    userId: string;
    username?: string;
  },
  config: EmailConfig,
) => {
  return sendEmail({
    apiKey: config.apiKey,
    defaultReplyTo: config.defaultReplyTo,
    from: config.from || DEFAULT_FROM,
    subject: "Sign-up attempt with your Acme account",
    tags: [
      { name: "type", value: "sign-up-attempt" },
      { name: "userId", value: userId },
    ],
    template: React.createElement(SignUpAttemptEmail, {
      resetPasswordUrl,
      signInUrl,
      userEmail,
      username,
    }),
    to: userEmail,
  });
};

const sendPasswordResetEmail = (
  {
    browserInfo,
    ipAddress,
    resetUrl,
    userEmail,
    userId,
    username,
  }: {
    browserInfo?: string;
    ipAddress?: string;
    resetUrl: string;
    userEmail: string;
    userId: string;
    username?: string;
  },
  config: EmailConfig,
) => {
  return sendEmail({
    apiKey: config.apiKey,
    defaultReplyTo: config.defaultReplyTo,
    from: config.from || DEFAULT_FROM,
    subject: "Reset your Acme password",
    tags: [
      { name: "type", value: "password-reset" },
      { name: "userId", value: userId },
    ],
    template: React.createElement(PasswordResetEmail, {
      browserInfo,
      ipAddress,
      resetUrl,
      userEmail,
      username,
    }),
    to: userEmail,
  });
};

const sendChangeEmailConfirmation = (
  {
    changeUrl,
    currentEmail,
    newEmail,
    userId,
    username,
  }: {
    changeUrl: string;
    currentEmail: string;
    newEmail: string;
    userId: string;
    username?: string;
  },
  config: EmailConfig,
) => {
  return sendEmail({
    apiKey: config.apiKey,
    defaultReplyTo: config.defaultReplyTo,
    from: config.from || DEFAULT_FROM,
    subject: "Confirm change of your Acme account email",
    tags: [
      { name: "type", value: "change-email-confirmation" },
      { name: "userId", value: userId },
    ],
    template: React.createElement(ChangeEmail, {
      changeUrl,
      currentEmail,
      newEmail,
      username,
    }),
    // Send to CURRENT email — this is the consent step. Better Auth's
    // sendVerificationEmail hook handles the second mailbox-ownership step
    // to the NEW email when the confirmation link is clicked.
    to: currentEmail,
  });
};

export {
  sendChangeEmailConfirmation,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSignUpAttemptEmail,
};
