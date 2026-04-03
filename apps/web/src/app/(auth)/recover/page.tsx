import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui";
import { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";

import RecoverForm from "@/app/(auth)/recover/form";

const metadata: Metadata = {
  title: "Recover your account - Acme",
};

const Page = () => {
  return (
    <ViewTransition
      default="none"
      enter={{ default: "none", "nav-back": "nav-back", "nav-forward": "nav-forward" }}
      exit={{ default: "none", "nav-back": "nav-back", "nav-forward": "nav-forward" }}
    >
      <div className="flex flex-col gap-4 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <Card>
          <CardHeader>
            <CardTitle>Recover your account</CardTitle>
            <CardDescription>Please enter your details so we can get in touch</CardDescription>
          </CardHeader>

          <CardContent>
            <RecoverForm />
          </CardContent>
        </Card>

        <div>
          <p className="text-center text-sm">
            Remembered your password?{" "}
            <Link
              className="font-semibold hover:text-neutral-600"
              href="/login"
              transitionTypes={["nav-back"]}
            >
              Log in into your account
            </Link>
          </p>
        </div>
      </div>
    </ViewTransition>
  );
};

export { metadata };

export default Page;
