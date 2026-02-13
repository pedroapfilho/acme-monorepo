"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div>
      <Button
        variant="outline"
        onClick={handleSignOut}
        disabled={isLoading}
      >
        {isLoading ? "Signing out" : "Sign Out"}
      </Button>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export { SignOutButton };
