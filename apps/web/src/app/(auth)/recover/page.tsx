import RecoverForm from "@/app/(auth)/recover/form";
import Link from "next/link";

const Page = () => {
  return (
    <>
      <div className="flex flex-col gap-4  sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="space-y-8 bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <h2 className="text-lg font-semibold">Recover your account</h2>

          <RecoverForm />
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
