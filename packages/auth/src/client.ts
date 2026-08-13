import { createAuthClient } from "better-auth/react";

const createBetterAuthClient = createAuthClient;

type AuthClient = ReturnType<typeof createBetterAuthClient>;

export { createBetterAuthClient };
export type { AuthClient };
