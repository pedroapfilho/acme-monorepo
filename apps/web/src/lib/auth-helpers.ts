import { auth } from "./auth";
import { headers } from "next/headers";
import { cache } from "react";

// Server-side function to get the current session
export const getSession = cache(async () => {
  const headersList = await headers();

  try {
    const session = await auth.api.getSession({
      headers: headersList,
    });

    return session;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
});

// Server-side function to get the current user
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  return session?.user || null;
});

// Check if user is authenticated
export const isAuthenticated = cache(async () => {
  const session = await getSession();
  return !!session;
});
