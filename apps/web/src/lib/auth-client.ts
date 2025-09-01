import { createBetterAuthClient } from "@repo/auth/client";

export const authClient = createBetterAuthClient(
  process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/auth` 
    : "http://localhost:3001/auth"
);

export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession,
  getSession,
  updateUser,
  deleteUser,
  forgetPassword,
  resetPassword,
  verifyEmail,
  sendVerificationEmail,
  changeEmail,
  changePassword,
  linkAccount,
  unlinkAccount,
  listAccounts,
  listSessions,
  revokeSession,
  revokeSessions,
  revokeOtherSessions,
} = authClient;