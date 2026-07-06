import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getSession } from "@/lib/auth-helpers";

export const metadata = {
  description: "Sign in to your Acme account.",
  title: "Acme",
};

// Redirect-only route: it reads the session to choose a destination and
// renders no UI, so the Suspense shell is empty — cacheComponents requires a
// boundary above the uncached session read.
const RedirectToDestination = async () => {
  const session = await getSession();
  redirect(session ? "/dashboard" : "/login");
};

const Page = () => (
  <Suspense fallback={null}>
    <RedirectToDestination />
  </Suspense>
);

export default Page;
