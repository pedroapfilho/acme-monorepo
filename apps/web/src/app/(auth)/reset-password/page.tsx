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

import ResetPasswordForm from "@/app/(auth)/reset-password/form";

const metadata: Metadata = {
  title: "Reset your password",
};

type Props = {
  searchParams: Promise<{ token?: string }>;
};

const ResetPasswordContent = async ({ searchParams }: Props) => {
  const { token = null } = await searchParams;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Reset your password</CardTitle>
        <CardDescription>Enter a new password for your account</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm token={token} />
      </CardContent>
    </Card>
  );
};

const ResetPasswordSkeleton = () => (
  <Card aria-hidden>
    <CardHeader className="text-center">
      <CardTitle className="text-xl">Reset your password</CardTitle>
      <CardDescription>Enter a new password for your account</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-4">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
    </CardContent>
  </Card>
);

const Page = (props: Props) => (
  <Suspense fallback={<ResetPasswordSkeleton />}>
    <ResetPasswordContent {...props} />
  </Suspense>
);

export { metadata };

export default Page;
