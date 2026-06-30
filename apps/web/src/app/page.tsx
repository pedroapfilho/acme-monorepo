import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth-helpers";

export const metadata = {
  description: "Sign in to your Acme account.",
  title: "Acme",
};

/**
 * Redirect-only route: it reads the session to choose a destination and renders
 * no UI, so there is no shell to stream — block the navigation.
 * @public Next.js app-router reads the `instant` route config via the module loader
 */
export const instant = false;

const Page = async () => {
  const session = await getSession();
  redirect(session ? "/dashboard" : "/login");
};

export default Page;
