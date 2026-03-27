import { createBetterAuthClient } from "@repo/auth/client";

// Better Auth requires absolute URLs for base URL validation.
// CSR: use the web app's own origin + /api/auth so requests go through the
// Next.js rewrite proxy (avoids cross-origin cookie issues with sameSite: lax).
// SSR: window is undefined, so use the API URL directly.
const baseURL =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/auth`
    : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/auth`;

export const authClient = createBetterAuthClient(baseURL);
