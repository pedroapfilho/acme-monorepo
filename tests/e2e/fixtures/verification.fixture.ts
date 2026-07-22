import { prisma } from "@repo/db";
import { signJWT } from "better-auth/crypto";

import { webUrl } from "../../../playwright.config";

const sleep = async (ms: number) => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};

const requireSecret = (): string => {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET is required for verification.fixture (it signs the same JWT Better Auth would).",
    );
  }
  return secret;
};

// Reconstructs the HS256 JWT Better Auth would email, so tests can skip inbox polling.
const forVerifyEmail = async (email: string): Promise<{ token: string; url: string }> => {
  const token = await signJWT({ email: email.toLowerCase() }, requireSecret(), 3600);
  const callbackURL = encodeURIComponent("/");
  const url = `${webUrl}/api/auth/verify-email?token=${token}&callbackURL=${callbackURL}`;
  return { token, url };
};

// Change-email JWTs differ only by requestType (confirmation vs verification).
type ChangeEmailUrls = {
  confirmationToken: string;
  confirmationUrl: string;
  verificationToken: string;
  verificationUrl: string;
};

const forChangeEmail = async (currentEmail: string, newEmail: string): Promise<ChangeEmailUrls> => {
  const secret = requireSecret();
  const callbackURL = encodeURIComponent("/dashboard");
  const basePayload = {
    email: currentEmail.toLowerCase(),
    updateTo: newEmail.toLowerCase(),
  };

  const confirmationToken = await signJWT(
    { ...basePayload, requestType: "change-email-confirmation" },
    secret,
    3600,
  );
  const verificationToken = await signJWT(
    { ...basePayload, requestType: "change-email-verification" },
    secret,
    3600,
  );

  return {
    confirmationToken,
    confirmationUrl: `${webUrl}/api/auth/verify-email?token=${confirmationToken}&callbackURL=${callbackURL}`,
    verificationToken,
    verificationUrl: `${webUrl}/api/auth/verify-email?token=${verificationToken}&callbackURL=${callbackURL}`,
  };
};

// Reset tokens live in the verification table (not JWTs); poll the DB.
const forResetPassword = async (
  email: string,
  timeoutMs = 5000,
): Promise<{ token: string; url: string }> => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) {
    throw new Error(`forResetPassword: no user with email ${email}`);
  }

  const deadline = Date.now() + timeoutMs;
  let lastError: string | undefined;

  while (Date.now() < deadline) {
    // eslint-disable-next-line no-await-in-loop
    const row = await prisma.verification.findFirst({
      orderBy: { createdAt: "desc" },
      where: {
        expiresAt: { gt: new Date() },
        identifier: { startsWith: "reset-password:" },
        value: user.id,
      },
    });

    if (row) {
      const token = row.identifier.replace(/^reset-password:/, "");
      const url = `${webUrl}/reset-password?token=${token}`;
      return { token, url };
    }

    lastError = `no row yet at ${new Date().toISOString()}`;
    // eslint-disable-next-line no-await-in-loop
    await sleep(100);
  }

  throw new Error(
    `forResetPassword: no reset-password verification for ${email} within ${timeoutMs}ms (${lastError ?? "no attempt logged"})`,
  );
};

const verification = {
  forChangeEmail,
  forResetPassword,
  forVerifyEmail,
};

export { verification };
