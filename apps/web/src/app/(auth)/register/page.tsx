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

import RegisterForm from "@/app/(auth)/register/form";
import { safeRedirectPath } from "@/lib/redirect-validation";

const metadata: Metadata = {
  title: "Create an account",
};

type Props = {
  searchParams: Promise<{ from?: string }>;
};

const RegisterContent = async ({ searchParams }: Props) => {
  const { from } = await searchParams;
  const safeTo = safeRedirectPath(from);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>Enter your details below to create your account</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm from={safeTo} />
      </CardContent>
    </Card>
  );
};

const RegisterSkeleton = () => (
  <Card aria-hidden>
    <CardHeader className="text-center">
      <CardTitle className="text-xl">Create your account</CardTitle>
      <CardDescription>Enter your details below to create your account</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-4">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
    </CardContent>
  </Card>
);

const Page = (props: Props) => (
  <Suspense fallback={<RegisterSkeleton />}>
    <RegisterContent {...props} />
  </Suspense>
);

export { metadata };

export default Page;
