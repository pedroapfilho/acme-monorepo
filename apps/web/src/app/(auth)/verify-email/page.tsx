import type { Metadata } from "next";

import PendingScreen from "./pending-screen";

export const metadata: Metadata = {
  description: "We sent you a verification email.",
  robots: { follow: false, index: false },
  title: "Verify your email",
};

type SearchParams = Promise<{ k?: string }>;

const VerifyEmailPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const { k } = await searchParams;
  return <PendingScreen token={k ?? null} />;
};

export default VerifyEmailPage;
