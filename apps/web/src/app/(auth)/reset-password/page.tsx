import { Metadata } from "next";
import { Suspense } from "react";

import ResetPasswordForm from "@/app/(auth)/reset-password/form";

const metadata: Metadata = {
  title: "Reset your password - Acme",
};

const Page = () => {
  return (
    <div className="flex flex-col gap-4 sm:mx-auto sm:w-full sm:max-w-[480px]">
      <div className="space-y-6 bg-white px-6 py-12 shadow sm:rounded-md sm:px-12">
        <div className="flex flex-col justify-center gap-4">
          <div>
            <h2 className="text-lg font-semibold">Reset your password</h2>

            <p className="text-sm text-neutral-500">Please enter your new credentials</p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4">
          <Suspense>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export { metadata };

export default Page;
