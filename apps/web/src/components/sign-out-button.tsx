"use client";

import { useRouter } from "next/navigation";

import { AuthActionButton } from "@/components/auth-action-button";
import { authClient } from "@/lib/auth-client";
import { routes } from "@/lib/routes";

const SignOutButton = () => {
  const { push } = useRouter();

  return (
    <AuthActionButton
      call={() => authClient.signOut()}
      className="self-start"
      fallbackError="Failed to sign out"
      onSuccess={() => {
        push(routes.login.path);
      }}
      pendingLabel="Signing out…"
      variant="outline"
    >
      Sign out
    </AuthActionButton>
  );
};

export { SignOutButton };
