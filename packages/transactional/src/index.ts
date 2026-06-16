export { AcmeLogo } from "./components/acme-logo";
export { Button } from "./components/button";
export { Card } from "./components/card";
export { Divider } from "./components/divider";

export { sendEmail, sendBatchEmails, previewEmail } from "./lib/send-email";
export type { MailerConfig, TransactionalEmail } from "./lib/senders";
export { sendTransactionalEmail } from "./lib/senders";

export { emailTheme, tailwindConfig } from "./styles/theme";
