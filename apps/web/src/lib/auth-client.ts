import { createBetterAuthClient } from "@repo/auth/client";

export const authClient = createBetterAuthClient(
  typeof window !== "undefined"
    ? `${window.location.origin}/api/auth`
    : process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/auth`
      : "http://localhost:3001/auth",
);
