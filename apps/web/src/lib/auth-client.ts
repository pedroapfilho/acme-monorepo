import { createBetterAuthClient } from "@repo/auth/client";

// Client-side: relative URL goes through Next.js proxy rewrite
// Server-side (prerendering): needs absolute URL as fallback
const baseURL =
  typeof window !== "undefined"
    ? "/api/auth"
    : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/auth`;

export const authClient = createBetterAuthClient(baseURL);
