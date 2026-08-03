"use client";

import { Button } from "@repo/ui/components/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { authClient } from "@/lib/auth-client";

const SignOutButton = () => {
  const { push } = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = () => {
    // aria-disabled keeps the button keyboard-activatable, so a second Enter
    // would re-enter sign-out without this.
    if (isPending) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await authClient.signOut();
        push("/login");
      } catch {
        setError("Failed to sign out. Please try again.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        aria-busy={isPending}
        aria-disabled={isPending}
        className="self-start"
        onClick={handleSignOut}
        variant="outline"
      >
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {isPending ? "Signing out…" : "Sign out"}
      </Button>
      {error !== null && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export { SignOutButton };
