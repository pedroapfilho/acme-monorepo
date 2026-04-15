import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Metadata } from "next";
import { Suspense } from "react";

import RegisterForm from "@/app/(auth)/register/form";

const metadata: Metadata = {
  title: "Create an account - Acme",
};

const Page = async () => {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>Enter your details below to create your account</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <RegisterForm />
        </Suspense>
      </CardContent>
    </Card>
  );
};

export { metadata };

export default Page;
