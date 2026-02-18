import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import RegisterForm from "@/app/(auth)/register/form";

const metadata: Metadata = {
  title: "Create an account - Acme",
};

const Page = async () => {
  return (
    <div className="flex flex-col gap-4 sm:mx-auto sm:w-full sm:max-w-[480px]">
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>

          <CardDescription>Please enter your details to create an account</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Suspense>
            <RegisterForm />
          </Suspense>
          <p className="text-sm">
            Already a member?{" "}
            <Link href="/login" className="font-semibold hover:text-neutral-600">
              Log in into your account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export { metadata };

export default Page;
