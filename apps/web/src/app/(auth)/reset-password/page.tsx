import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

import ResetPasswordForm from "@/app/(auth)/reset-password/form";

const metadata: Metadata = {
  title: "Reset your password",
};

type Props = {
  searchParams: Promise<{ error?: string; token?: string }>;
};

const ResetPasswordSkeleton = () => (
  <>
    <CardHeader aria-hidden className="items-center">
      <Skeleton className="h-7 w-44" />
      <Skeleton className="h-5 w-56" />
    </CardHeader>
    <CardContent aria-hidden className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
      <Skeleton className="h-8" />
    </CardContent>
  </>
);

const Page = ({ searchParams }: Props) => (
  <Card>
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordForm searchParams={searchParams} />
    </Suspense>
  </Card>
);

/** @public Next.js app-router reads the instant segment config via the module loader */
export const instant = true;

export { metadata };

export default Page;
