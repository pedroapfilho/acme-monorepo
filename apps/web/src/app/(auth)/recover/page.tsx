import RecoverForm from "@/app/(auth)/recover/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { Metadata } from "next";
import Link from "next/link";

const metadata: Metadata = {
  title: "Recover your account - Hasteo",
};

const Page = () => {
  return (
    <div className="flex flex-col gap-4 sm:mx-auto sm:w-full sm:max-w-[480px]">
      <Card>
        <CardHeader>
          <CardTitle>Recover your account</CardTitle>
          <CardDescription>
            Please enter your details so we can get in touch
          </CardDescription>
        </CardHeader>

        <CardContent>
          <RecoverForm />
        </CardContent>
      </Card>

      <div>
        <p className="text-center text-sm">
          Remembered your password?{" "}
          <Link href="/login" className="font-semibold hover:text-neutral-600">
            Log in into your account
          </Link>
        </p>
      </div>
    </div>
  );
};

export { metadata };

export default Page;
