import { z } from "zod";

// Resend allows RFC 5322 "Name <email>" for from/reply-to; z.email() is bare-only so extract the bracketed address.
const senderAddressSchema = z.string().refine(
  (val) => {
    const wrapped = /^.+<(?<address>[^<>\s]+)>$/v.exec(val);
    const email = wrapped?.groups?.address ?? val;
    return z.email().safeParse(email).success;
  },
  { message: "Must be a valid email or 'Display Name <email>' format" },
);

export { senderAddressSchema };
