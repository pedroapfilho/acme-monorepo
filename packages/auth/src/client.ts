import { createAuthClient } from "better-auth/react";
import type { Auth } from "./server";

export const createBetterAuthClient = (baseURL: string = "/api/auth") => {
  return createAuthClient<typeof Auth>({
    baseURL,
  });
};

export type AuthClient = ReturnType<typeof createBetterAuthClient>;