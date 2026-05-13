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
    username,
    verificationUrl,
  }: {
    userEmail: string;
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
      ...(username ? [{ name: "username", value: username }] : []),
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
    username,
  }: {
    resetPasswordUrl: string;
    signInUrl: string;
    userEmail: string;
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
      ...(username ? [{ name: "username", value: username }] : []),
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
    username,
  }: {
    browserInfo?: string;
    ipAddress?: string;
    resetUrl: string;
    userEmail: string;
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
      ...(username ? [{ name: "username", value: username }] : []),
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
    username,
  }: {
    changeUrl: string;
    currentEmail: string;
    newEmail: string;
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
      ...(username ? [{ name: "username", value: username }] : []),
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
