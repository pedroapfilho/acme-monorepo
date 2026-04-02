import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui";
import { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";

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
    <ViewTransition
      default="none"
      enter={{ default: "none", "nav-back": "nav-back", "nav-forward": "nav-forward" }}
      exit={{ default: "none", "nav-back": "nav-back", "nav-forward": "nav-forward" }}
    >
      <div className="flex flex-col gap-4 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <Card>
          <CardHeader>
            <CardTitle>Log In to Acme</CardTitle>
            <CardDescription>Please enter your details to login</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <LoginForm from={from} />

            <p className="text-sm">
              Not a member yet?{" "}
              <Link
                className="font-semibold hover:text-neutral-600"
                href="/register"
                transitionTypes={["nav-forward"]}
              >
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>

        <div>
          <p className="text-center text-sm">
            Lost your account?{" "}
            <Link
              className="font-semibold hover:text-neutral-600"
              href="/recover"
              transitionTypes={["nav-forward"]}
            >
              Let&apos;s try to recover it
            </Link>
          </p>
        </div>
      </div>
    </ViewTransition>
  );
};

export { metadata };

export default Page;
