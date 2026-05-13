// Client
export { createResendClient } from "./client";

// Components
export { AcmeLogo } from "./components/acme-logo";
export { Button } from "./components/button";
export { Card } from "./components/card";
export { Divider } from "./components/divider";

// Utilities
export { sendEmail, sendBatchEmails, previewEmail } from "./utils/send-email";
export {
  sendChangeEmailConfirmation,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSignUpAttemptEmail,
} from "./utils/senders";

// Theme
export { emailTheme, tailwindConfig } from "./styles/theme";
