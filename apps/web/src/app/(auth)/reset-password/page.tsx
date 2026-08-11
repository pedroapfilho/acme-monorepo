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
  robots: {
    follow: false,
    index: false,
  },
  title: "Reset your password",
};

type Props = {
  searchParams: Promise<{ token?: string }>;
};

const Page = ({ searchParams }: Props) => (
  <Card>
    <CardHeader className="text-center">
      <CardTitle className="text-xl">Reset your password</CardTitle>
      <CardDescription>Enter a new password for your account</CardDescription>
    </CardHeader>
    <CardContent>
      <ResetPasswordForm searchParams={searchParams} />
    </CardContent>
  </Card>
);

/** @public Next.js app-router reads the instant segment config via the module loader */
export const instant = true;

export { metadata };

export default Page;
