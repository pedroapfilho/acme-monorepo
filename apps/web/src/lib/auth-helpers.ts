import { headers } from "next/headers";
import { cache } from "react";

import { getAuth } from "./auth";

export const getSession = cache(async () => {
  const headersList = await headers();
  return getAuth().api.getSession({ headers: headersList });
});
