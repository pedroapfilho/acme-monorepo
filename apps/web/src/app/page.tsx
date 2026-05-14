import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth-helpers";

export const metadata = {
  description: "Sign in to your Acme account.",
  title: "Acme",
};

const Page = async () => {
  const session = await getSession();
  redirect(session ? "/dashboard" : "/login");
};

export default Page;
