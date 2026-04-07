import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui";
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
        <Suspense>
          <RegisterForm />
        </Suspense>
      </CardContent>
    </Card>
  );
};

export { metadata };

export default Page;
