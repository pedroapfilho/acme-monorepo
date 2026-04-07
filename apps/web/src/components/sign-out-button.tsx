"use client";

import { Button } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BoneyardSkeleton } from "@/components/boneyard-skeleton";
import { authClient } from "@/lib/auth-client";

const SignOutButton = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.signOut();
      router.push("/login");
    } catch {
      setIsLoading(false);
      setError("Failed to sign out. Please try again.");
    }
  };

  return (
    <BoneyardSkeleton
      fixture={<div className="h-10 w-24 rounded bg-neutral-200" />}
      loading={isLoading}
      name="sign-out-button"
    >
      <div>
        <Button disabled={isLoading} onClick={handleSignOut} variant="outline">
          {isLoading ? "Signing out" : "Sign Out"}
        </Button>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    </BoneyardSkeleton>
  );
};

export { SignOutButton };
