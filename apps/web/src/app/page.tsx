import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth-helpers";

export const metadata = {
  description: "Sign in to your Acme account.",
  title: "Acme",
};

/** @public Next.js reads this segment config; the route only redirects, so it may block. */
export const instant = false;

const Page = async () => {
  const session = await getSession();
  redirect(session ? "/dashboard" : "/login");
};

export default Page;
