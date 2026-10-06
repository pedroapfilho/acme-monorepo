"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AuthActionButton } from "@/components/auth-form";
import { authClient } from "@/lib/auth-client";
import { authPageHref } from "@/lib/redirect-validation";

const RevokeSessionButton = ({ token }: { token: string }) => {
  const { refresh } = useRouter();

  return (
    <AuthActionButton
      call={() => authClient.revokeSession({ token })}
      fallbackError="Failed to revoke session"
      onSuccess={refresh}
      pendingLabel="Revoking…"
      size="sm"
      variant="outline"
    >
      Revoke
    </AuthActionButton>
  );
};

const RevokeOtherSessionsButton = () => {
  const { refresh } = useRouter();

  return (
    <AuthActionButton
      call={() => authClient.revokeOtherSessions()}
      className="w-fit"
      fallbackError="Failed to revoke sessions"
      onSuccess={() => {
        toast.success("Other sessions signed out");
        refresh();
      }}
      pendingLabel="Signing out…"
      variant="outline"
    >
      Sign out other sessions
    </AuthActionButton>
  );
};

const ReauthenticateButton = () => {
  const { push, refresh } = useRouter();

  return (
    <AuthActionButton
      call={() => authClient.signOut()}
      className="w-fit"
      fallbackError="Failed to sign out"
      onSuccess={() => {
        push(authPageHref("/login", "/dashboard/settings"));
        refresh();
      }}
      pendingLabel="Signing out…"
      variant="outline"
    >
      Sign in again
    </AuthActionButton>
  );
};

export { ReauthenticateButton, RevokeOtherSessionsButton, RevokeSessionButton };
