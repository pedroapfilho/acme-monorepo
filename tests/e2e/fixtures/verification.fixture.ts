import { db, user, verification as verificationTable } from "@repo/db";
import { signJWT } from "better-auth/crypto";
import { and, desc, eq, gt, like } from "drizzle-orm";

import { webUrl } from "../../../playwright.config";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const requireSecret = (): string => {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET is required for verification.fixture (it signs the same JWT Better Auth would).",
    );
  }
  return secret;
};

// Reconstructs the HS256 JWT (`{email}` signed with the auth secret) that
// Better Auth would have emailed, so tests can skip inbox polling.
const forVerifyEmail = async (email: string): Promise<{ token: string; url: string }> => {
  const token = await signJWT({ email: email.toLowerCase() }, requireSecret(), 3600);
  const callbackURL = encodeURIComponent("/");
  const url = `${webUrl}/api/auth/verify-email?token=${token}&callbackURL=${callbackURL}`;
  return { token, url };
};

// Two-stage change-email JWTs share email/updateTo/secret; only requestType
// differs (confirmation → current mailbox, verification → new mailbox).
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

// Reset uses a random token persisted in the verification table (not a JWT),
// so this polls the DB; Better Auth writes the row synchronously.
const forResetPassword = async (
  email: string,
  timeoutMs = 5000,
): Promise<{ token: string; url: string }> => {
  const [foundUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email.toLowerCase()))
    .limit(1);

  if (!foundUser) {
    throw new Error(`forResetPassword: no user with email ${email}`);
  }

  const deadline = Date.now() + timeoutMs;
  let lastError: string | undefined;

  while (Date.now() < deadline) {
    // eslint-disable-next-line no-await-in-loop
    const [row] = await db
      .select()
      .from(verificationTable)
      .where(
        and(
          gt(verificationTable.expiresAt, new Date().toISOString()),
          like(verificationTable.identifier, "reset-password:%"),
          eq(verificationTable.value, foundUser.id),
        ),
      )
      .orderBy(desc(verificationTable.createdAt))
      .limit(1);

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

const verificationFixture = {
  forChangeEmail,
  forResetPassword,
  forVerifyEmail,
};

export { verificationFixture as verification };
