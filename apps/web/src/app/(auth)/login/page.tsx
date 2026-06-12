import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import type { Metadata } from "next";

import LoginForm from "@/app/(auth)/login/form";
import { safeRedirectPath } from "@/lib/redirect-validation";

const metadata: Metadata = {
  description: "Sign in to your Acme account to access your dashboard and manage your profile.",
  robots: {
    follow: false,
    index: false, // Don't index auth pages
  },
  title: "Sign In",
};

type Props = {
  searchParams: Promise<{ from?: string }>;
};

const Page = async ({ searchParams }: Props) => {
  const { from } = await searchParams;
  // Sanitise the redirect target server-side: safeRedirectPath is the single
  // open-redirect gate — only in-app relative paths survive (e.g.
  // /login?from=https://evil.com falls back to /dashboard).
  const safeTo = safeRedirectPath(from);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Enter your details to sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm from={safeTo} />
      </CardContent>
    </Card>
  );
};

export { metadata };

export default Page;
