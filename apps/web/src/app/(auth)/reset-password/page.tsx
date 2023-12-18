import ResetPasswordForm from "@/app/(auth)/reset-password/form";
import Link from "next/link";

const Page = () => {
  return (
    <>
      <div className="flex flex-col gap-4  sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="space-y-8 bg-white px-6 py-12 shadow sm:rounded-md sm:px-12">
          <h2 className="text-lg font-semibold">Reset your password</h2>

          <ResetPasswordForm />
        </div>

        <div>
          <p className="text-center text-sm">
            Remembered your address?{" "}
            <Link
              href="/login"
              className="font-semibold leading-6 hover:text-neutral-600"
            >
              Log in into your account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Page;
