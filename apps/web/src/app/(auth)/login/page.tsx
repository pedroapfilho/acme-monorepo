import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

import LoginForm from "@/app/(auth)/login/form";
import { safeRedirectPath } from "@/lib/redirect-validation";

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

const LoginContent = async ({ searchParams }: Props) => {
  const { from, message } = await searchParams;
  const safeTo = safeRedirectPath(from);
  const isAfterPasswordReset = message === "password-reset-success";

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>
          {isAfterPasswordReset
            ? "Your password was reset. Sign in with your new password."
            : "Enter your details to sign in to your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm from={safeTo} />
      </CardContent>
    </Card>
  );
};

const LoginSkeleton = () => (
  <Card aria-hidden>
    <CardHeader className="text-center">
      <CardTitle className="text-xl">Welcome back</CardTitle>
      <CardDescription>Enter your details to sign in to your account</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-4">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
    </CardContent>
  </Card>
);

const Page = (props: Props) => (
  <Suspense fallback={<LoginSkeleton />}>
    <LoginContent {...props} />
  </Suspense>
);

export { metadata };

export default Page;
