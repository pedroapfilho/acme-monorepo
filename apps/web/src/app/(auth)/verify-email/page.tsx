import type { Metadata } from "next";

import PendingScreen from "./pending-screen";

export const metadata: Metadata = {
  description: "We sent you a verification email.",
  robots: { follow: false, index: false },
  title: "Verify your email",
};

type SearchParams = Promise<{ email?: string }>;

const VerifyEmailPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const { email } = await searchParams;
  return <PendingScreen email={email ?? null} />;
};

export default VerifyEmailPage;
