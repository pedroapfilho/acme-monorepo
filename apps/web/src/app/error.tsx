"use client";

import { log } from "@repo/observability";
import { Button } from "@repo/ui/components/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const Error = ({ error, reset }: ErrorProps) => {
  useEffect(() => {
    log.error({ error, message: "Route error boundary" });
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-5 text-destructive" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Something went wrong</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          An unexpected error occurred. Please try again. If it keeps happening, refresh the page or
          come back in a few minutes.
        </p>
      </div>
      <Button onClick={reset}>
        <RefreshCw className="size-4" />
        Try again
      </Button>
    </main>
  );
};

export default Error;
