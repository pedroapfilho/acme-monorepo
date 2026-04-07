import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui";
import { Metadata } from "next";

import RecoverForm from "@/app/(auth)/recover/form";

const metadata: Metadata = {
  title: "Recover your account - Acme",
};

const Page = () => {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Recover your account</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RecoverForm />
      </CardContent>
    </Card>
  );
};

export { metadata };

export default Page;
