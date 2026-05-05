import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth-helpers";

const Page = async () => {
  const session = await getSession();
  redirect(session ? "/dashboard" : "/login");
};

export default Page;
