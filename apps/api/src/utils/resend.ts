import { Resend } from "resend";

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY_NOT_PROVIDED");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  return resend;
};

export default getResendClient;
