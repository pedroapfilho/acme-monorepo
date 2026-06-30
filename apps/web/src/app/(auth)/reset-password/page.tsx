import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import type { Metadata } from "next";

import ResetPasswordForm from "@/app/(auth)/reset-password/form";

const metadata: Metadata = {
  title: "Reset your password",
};

/**
 * Entry page reached from the password-reset email link; its form is bound to
 * the `token` search param, so block rather than stream a shell.
 * @public Next.js app-router reads the `instant` route config via the module loader
 */
export const instant = false;

type Props = {
  searchParams: Promise<{ token?: string }>;
};

const Page = async ({ searchParams }: Props) => {
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

export { metadata };

export default Page;
