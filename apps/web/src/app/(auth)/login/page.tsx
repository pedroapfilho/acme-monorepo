import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui";
import { Metadata } from "next";

import LoginForm from "@/app/(auth)/login/form";

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
  const { from = "/dashboard" } = await searchParams;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Enter your details to sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm from={from} />
      </CardContent>
    </Card>
  );
};

export { metadata };

export default Page;
