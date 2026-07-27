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

export { metadata };

export default Page;
