"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "../components/button";
import { cn } from "../lib/utils";

type BoundaryError = Error & { digest?: string };

type ErrorBoundaryProps = {
  error: BoundaryError;
  retry: () => void;
};

type ErrorReportProps = ErrorBoundaryProps & {
  description: string;
  report: (error: BoundaryError) => void;
};

const RouteError = ({
  className,
  description,
  error,
  report,
  retry,
}: ErrorReportProps & { className?: string }) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    report(error);
    headingRef.current?.focus();
  }, [error, report]);

  return (
    <section className={cn("flex flex-col items-center gap-6 px-6 text-center", className)}>
      <div className="flex flex-col gap-2">
        <h1
          className="text-2xl font-semibold text-foreground outline-none"
          ref={headingRef}
          tabIndex={-1}
        >
          Something went wrong
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        {error.digest !== undefined && (
          <p className="text-xs text-muted-foreground">Reference: {error.digest}</p>
        )}
      </div>
      <Button onClick={retry}>
        <RefreshCw aria-hidden="true" data-icon="inline-start" />
        Try again
      </Button>
    </section>
  );
};

export { RouteError };

export type { ErrorBoundaryProps, ErrorReportProps };
