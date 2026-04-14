"use client";

import { Button } from "@repo/ui/components/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div className="flex flex-col gap-2">
      <Button className="self-start" disabled={isLoading} onClick={handleSignOut} variant="outline">
        {isLoading && <Loader2 className="size-4 animate-spin" />}
        {isLoading ? "Signing out" : "Sign out"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export { SignOutButton };
