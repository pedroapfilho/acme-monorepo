import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import type { Metadata } from "next";

import RegisterForm from "@/app/(auth)/register/form";
import { safeRedirectPath } from "@/lib/redirect-validation";

const metadata: Metadata = {
  title: "Create an account",
};

/**
 * Entry page bound to the `from` search param carried over from the login
 * cross-link, so block rather than stream a shell.
 * @public Next.js app-router reads the `instant` route config via the module loader
 */
export const instant = false;

type Props = {
  searchParams: Promise<{ from?: string }>;
};

const Page = async ({ searchParams }: Props) => {
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

export { metadata };

export default Page;
