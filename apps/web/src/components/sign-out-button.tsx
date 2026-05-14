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
      <Button className="self-start" disabled={isPending} onClick={handleSignOut} variant="outline">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {isPending ? "Signing out" : "Sign out"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export { SignOutButton };
