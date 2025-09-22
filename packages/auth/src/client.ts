import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const createBetterAuthClient = (baseURL: string = "/api/auth") => {
  return createAuthClient({
    baseURL,
    plugins: [usernameClient()],
  });
};

export type AuthClient = ReturnType<typeof createBetterAuthClient>;
