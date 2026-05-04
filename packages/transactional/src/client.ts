import { Resend } from "resend";

const createResendClient = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not provided");
  }
  return new Resend(apiKey);
};

export { createResendClient };
