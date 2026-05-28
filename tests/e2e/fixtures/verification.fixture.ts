import { prisma } from "@repo/db";
import { signJWT } from "better-auth/crypto";

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

// Builds the verify-email JWT Better Auth would have signed for `email`.
// Better Auth doesn't persist this token — it's a pure HS256 JWT of
// `{email}` keyed with the auth secret. Reconstructing it lets tests skip
// inbox polling entirely. See node_modules/better-auth/dist/api/routes/
// email-verification.mjs:createEmailVerificationToken.
const forVerifyEmail = async (email: string): Promise<{ token: string; url: string }> => {
  const token = await signJWT({ email: email.toLowerCase() }, requireSecret(), 3600);
  // Matches @repo/auth's emailVerification.callbackURL — the verify-email
  // handler redirects here after token exchange, and (with
  // autoSignInAfterVerification: false) does so without setting a session
  // cookie on the device that clicked the link.
  const callbackURL = encodeURIComponent("/verify-email/success");
  const url = `${webUrl}/api/auth/verify-email?token=${token}&callbackURL=${callbackURL}`;
  return { token, url };
};

// Two-stage change-email flow. Stage 1 (`change-email-confirmation`) goes to
// CURRENT email and proves consent; clicking it triggers stage 2
// (`change-email-verification`) sent to NEW email which actually updates
// the user record. Both JWTs share email/updateTo/secret — only requestType
// differs — so we reconstruct both up-front and let the test drive each
// click independently. See update-user.mjs:466-490 and
// email-verification.mjs:177-200.
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

// Password reset uses a random token persisted in the verification table —
// NOT a JWT — so the fixture polls the DB. Better Auth writes the row
// synchronously in the `/forget-password` handler, so a tight poll loop
// converges within a few hundred ms (default timeout still generous).
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

  // Polling is intentionally sequential — we're waiting for a DB row to
  // appear, so parallelizing wouldn't help.
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
