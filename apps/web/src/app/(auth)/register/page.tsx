import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import type { Metadata } from "next";

import RegisterForm from "@/app/(auth)/register/form";

const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "Create an account",
};

type Props = {
  searchParams: Promise<{ from?: string }>;
};

const Page = ({ searchParams }: Props) => (
  <Card>
    <CardHeader className="text-center">
      <CardTitle className="text-xl">Create your account</CardTitle>
      <CardDescription>Enter your details below to create your account</CardDescription>
    </CardHeader>
    <CardContent>
      <RegisterForm searchParams={searchParams} />
    </CardContent>
  </Card>
);

/** @public Next.js app-router reads the instant segment config via the module loader */
export const instant = true;

export { metadata };

export default Page;
