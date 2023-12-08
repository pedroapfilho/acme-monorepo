import LoginForm from "@/app/(auth)/login/form";
import Link from "next/link";

const Page = async () => {
  return (
    <>
      <div className="flex flex-col gap-4 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="space-y-8 bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <h2 className="text-lg font-semibold">Log In to Acme</h2>

          <LoginForm />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-center text-sm">
            Not a member yet?{" "}
            <Link
              href="/register"
              className="font-semibold leading-6 hover:text-neutral-600"
            >
              Create an account
            </Link>
          </p>

          <p className="text-center text-sm">
            Lost your account?{" "}
            <Link
              href="/recover"
              className="font-semibold leading-6 hover:text-neutral-600"
            >
              Let&apos;s try to recover it
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Page;
