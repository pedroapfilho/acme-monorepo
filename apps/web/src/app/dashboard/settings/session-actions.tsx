"use client";

import { Button } from "@repo/ui/components/button";
import { toast } from "@repo/ui/components/sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { authClient } from "@/lib/auth-client";

const RevokeSessionButton = ({ token }: { token: string }) => {
  const { refresh } = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRevoke = () => {
    if (isPending) {
      return;
    }
    startTransition(async () => {
      try {
        const result = await authClient.revokeSession({ token });
        if (result.error) {
          toast.error(result.error.message ?? "Failed to revoke session");
          return;
        }
        refresh();
      } catch {
        toast.error("Failed to revoke session. Please try again.");
      }
    });
  };

  return (
    <Button
      aria-busy={isPending}
      aria-disabled={isPending}
      onClick={handleRevoke}
      size="sm"
      variant="outline"
    >
      {isPending && <Loader2 className="size-4 motion-safe:animate-spin" />}
      {isPending ? "Revoking…" : "Revoke"}
    </Button>
  );
};

const RevokeOtherSessionsButton = () => {
  const { refresh } = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRevokeOthers = () => {
    if (isPending) {
      return;
    }
    startTransition(async () => {
      try {
        const result = await authClient.revokeOtherSessions();
        if (result.error) {
          toast.error(result.error.message ?? "Failed to revoke sessions");
          return;
        }
        toast.success("Other sessions signed out");
        refresh();
      } catch {
        toast.error("Failed to revoke sessions. Please try again.");
      }
    });
  };

  return (
    <Button
      aria-busy={isPending}
      aria-disabled={isPending}
      className="w-fit"
      onClick={handleRevokeOthers}
      variant="outline"
    >
      {isPending && <Loader2 className="size-4 motion-safe:animate-spin" />}
      {isPending ? "Signing out…" : "Sign out other sessions"}
    </Button>
  );
};

const ReauthenticateButton = () => {
  const { push, refresh } = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleReauthenticate = () => {
    if (isPending) {
      return;
    }
    startTransition(async () => {
      try {
        const result = await authClient.signOut();
        if (result.error) {
          toast.error(result.error.message ?? "Failed to sign out");
          return;
        }
        push("/login?from=/dashboard/settings");
        refresh();
      } catch {
        toast.error("Failed to sign out. Please try again.");
      }
    });
  };

  return (
    <Button
      aria-busy={isPending}
      aria-disabled={isPending}
      className="w-fit"
      onClick={handleReauthenticate}
      variant="outline"
    >
      {isPending && <Loader2 className="size-4 motion-safe:animate-spin" />}
      {isPending ? "Signing out…" : "Sign in again"}
    </Button>
  );
};

export { ReauthenticateButton, RevokeOtherSessionsButton, RevokeSessionButton };
