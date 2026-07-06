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
  // Carried over from the login form's cross-link (the proxy bounces
  // logged-out visitors to /login?from=<path>). Sanitised server-side like
  // the login page; the form bakes it into the verification email's
  // callbackURL so the clicker lands back where they started.
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

// Static shell for the prerender: the content is bound to the `from` search
// param, so cacheComponents needs a Suspense boundary above it.
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
