import { expect } from "@playwright/test";

import { extractLink, waitForEmail } from "../helpers/resend";

type DeliveredMail = Parameters<typeof waitForEmail>[0];

const verificationLink = async (match: DeliveredMail): Promise<string> => {
  const mail = await waitForEmail(match);
  expect(mail.last_event).not.toBe("bounced");
  return extractLink(mail, /\/api\/auth\/verify-email\?token=/v);
};

export { verificationLink };
