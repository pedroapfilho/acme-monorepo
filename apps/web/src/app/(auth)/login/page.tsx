import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import type { Metadata } from "next";
import { Suspense } from "react";

import LoginForm from "@/app/(auth)/login/form";

const metadata: Metadata = {
  description: "Sign in to your Acme account to access your dashboard and manage your profile.",
  robots: {
    follow: false,
    index: false,
  },
  title: "Sign In",
};

type Props = {
  searchParams: Promise<{ from?: string; message?: string }>;
};

const LoginDescription = async ({ searchParams }: Props) => {
  const { message } = await searchParams;
  const isAfterPasswordReset = message === "password-reset-success";

  return isAfterPasswordReset
    ? "Your password was reset. Sign in with your new password."
    : "Enter your details to sign in to your account";
};

const Page = ({ searchParams }: Props) => (
  <Card>
    <CardHeader className="text-center">
      <CardTitle className="text-xl">Welcome back</CardTitle>
      <CardDescription>
        <Suspense fallback="Enter your details to sign in to your account">
          <LoginDescription searchParams={searchParams} />
        </Suspense>
      </CardDescription>
    </CardHeader>
    <CardContent>
      <LoginForm searchParams={searchParams} />
    </CardContent>
  </Card>
);

export { metadata };

export default Page;
