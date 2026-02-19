import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import LoginForm from "@/app/(auth)/login/form";

const metadata: Metadata = {
  description: "Sign in to your Acme account to access your dashboard and manage your profile.",
  robots: {
    follow: false,
    index: false, // Don't index auth pages
  },
  title: "Sign In",
};

const Page = async () => {
  return (
    <div className="flex flex-col gap-4 sm:mx-auto sm:w-full sm:max-w-[480px]">
      <Card>
        <CardHeader>
          <CardTitle>Log In to Acme</CardTitle>
          <CardDescription>Please enter your details to login</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Suspense>
            <LoginForm />
          </Suspense>

          <p className="text-sm">
            Not a member yet?{" "}
            <Link className="font-semibold hover:text-neutral-600" href="/register">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>

      <div>
        <p className="text-center text-sm">
          Lost your account?{" "}
          <Link className="font-semibold hover:text-neutral-600" href="/recover">
            Let&apos;s try to recover it
          </Link>
        </p>
      </div>
    </div>
  );
};

export { metadata };

export default Page;
