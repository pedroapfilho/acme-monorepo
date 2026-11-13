import { extractLink, waitForEmail } from "../helpers/mail";

type DeliveredMail = Parameters<typeof waitForEmail>[0];

const verificationLink = async (match: DeliveredMail): Promise<string> =>
  extractLink(await waitForEmail(match), /\/api\/auth\/verify-email\?token=/v);

export { verificationLink };
