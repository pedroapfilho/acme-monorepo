"use client";

import { Button } from "@repo/ui/components/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect, useRef } from "react";

import { log } from "@/lib/observability-client";

type RouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const RouteError = ({ error, reset }: RouteErrorProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    log.error({ digest: error.digest, error: error.message, message: "Route error boundary" });
    headingRef.current?.focus();
  }, [error]);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center"
      id="main-content"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-5 text-destructive" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground" ref={headingRef} tabIndex={-1}>
          Something went wrong
        </h1>
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

export default RouteError;
