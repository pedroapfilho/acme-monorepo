// Client
export { createResendClient } from "./client";

// Components
export * from "./components";

// Utilities
export { sendEmail, sendBatchEmails, previewEmail } from "./utils/send-email";
export { sendWelcomeEmail, sendPasswordResetEmail, sendSignUpAttemptEmail } from "./utils/senders";

// Theme
export { emailTheme, tailwindConfig } from "./styles/theme";
