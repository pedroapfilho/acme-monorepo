import { createBetterAuthClient } from "@repo/auth/client";

// During CSR the relative URL is rewritten by Next.js (next.config.ts:
// /api/auth/* → API /auth/*) so the browser never calls the API directly.
// During SSR/prerendering window is undefined, so an absolute URL is required
// because the rewrite layer does not apply server-side.
const baseURL =
  typeof window !== "undefined"
    ? "/api/auth"
    : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/auth`;

export const authClient = createBetterAuthClient(baseURL);
