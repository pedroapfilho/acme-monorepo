import LoginForm from "@/app/(auth)/login/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

const metadata: Metadata = {
  title: "Log in - Hasteo",
};

const Page = async () => {
  return (
    <div className="flex flex-col gap-4 sm:mx-auto sm:w-full sm:max-w-[480px]">
      <Card>
        <CardHeader>
          <CardTitle> Log In to Hasteo</CardTitle>
          <CardDescription>Please enter your details to login</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Suspense>
            <LoginForm />
          </Suspense>

          <p className="text-sm">
            Not a member yet?{" "}
            <Link
              href="/register"
              className="font-semibold hover:text-neutral-600"
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
            href="/recover"
            className="font-semibold hover:text-neutral-600"
          >
            Let&apos;s try to recover it
          </Link>
        </p>
      </div>
    </div>
  );
};

export { metadata };

export default Page;
