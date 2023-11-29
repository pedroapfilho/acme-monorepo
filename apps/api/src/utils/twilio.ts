import twilio from "twilio";

const getTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID) {
    throw new Error("TWILIO_ACCOUNT_SID_NOT_PROVIDED");
  }

  if (!process.env.TWILIO_AUTH_TOKEN) {
    throw new Error("TWILIO_AUTH_TOKEN_NOT_PROVIDED");
  }

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );

  return client;
};

export default getTwilioClient;
