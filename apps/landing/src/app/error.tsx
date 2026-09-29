"use client";

import { Button } from "@repo/ui/components/button";
import { RefreshCw } from "lucide-react";
import { useEffect, useRef } from "react";

import { log } from "@/lib/observability-client";

type RouteErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

const RouteError = ({ error, retry }: RouteErrorProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    log.error({ digest: error.digest, error: error.message, message: "Route error boundary" });
    headingRef.current?.focus();
  }, [error]);

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <p className="font-mono text-sm tracking-wide text-primary uppercase">Error</p>
        <h1
          className="mt-4 max-w-(--container-measure-heading) text-3xl font-semibold tracking-tight text-balance outline-none md:text-4xl"
          ref={headingRef}
          tabIndex={-1}
        >
          Something went wrong.
        </h1>
        <p className="mt-4 max-w-(--container-measure-body) text-lg text-pretty text-muted-foreground">
          This page failed to load. Try again, and if it keeps happening, come back in a few
          minutes.
        </p>
        <Button className="mt-8" onClick={retry} size="lg" variant="outline">
          <RefreshCw aria-hidden="true" data-icon="inline-start" />
          Try again
        </Button>
        {error.digest !== undefined && (
          <p className="mt-6 font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
        )}
      </div>
    </section>
  );
};

export default RouteError;
