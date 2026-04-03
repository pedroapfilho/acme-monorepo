import { Metadata } from "next";
import { ViewTransition } from "react";

import ResetPasswordForm from "@/app/(auth)/reset-password/form";

const metadata: Metadata = {
  title: "Reset your password - Acme",
};

type Props = {
  searchParams: Promise<{ token?: string }>;
};

const Page = async ({ searchParams }: Props) => {
  const { token = null } = await searchParams;

  return (
    <ViewTransition
      default="none"
      enter={{ default: "none", "nav-back": "nav-back", "nav-forward": "nav-forward" }}
      exit={{ default: "none", "nav-back": "nav-back", "nav-forward": "nav-forward" }}
    >
      <div className="flex flex-col gap-4 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="space-y-6 bg-white px-6 py-12 shadow sm:rounded-md sm:px-12">
          <div className="flex flex-col justify-center gap-4">
            <div>
              <h2 className="text-lg font-semibold">Reset your password</h2>

              <p className="text-sm text-neutral-500">Please enter your new credentials</p>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4">
            <ResetPasswordForm token={token} />
          </div>
        </div>
      </div>
    </ViewTransition>
  );
};

export { metadata };

export default Page;
