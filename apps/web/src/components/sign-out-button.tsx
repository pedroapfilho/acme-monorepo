"use client";

import { useRouter } from "next/navigation";

import { AuthActionButton } from "@/components/auth-form";
import { authClient } from "@/lib/auth-client";

const SignOutButton = () => {
  const { push } = useRouter();

  return (
    <AuthActionButton
      call={() => authClient.signOut()}
      className="self-start"
      fallbackError="Failed to sign out"
      onSuccess={() => {
        push("/login");
      }}
      pendingLabel="Signing out…"
      variant="outline"
    >
      Sign out
    </AuthActionButton>
  );
};

export { SignOutButton };
