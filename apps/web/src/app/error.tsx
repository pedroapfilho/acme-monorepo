"use client";

import { RouteError } from "@repo/ui/compositions/route-error";
import type { ErrorBoundaryProps } from "@repo/ui/compositions/route-error";

import { reportError } from "@/lib/observability-client";

const AppRouteError = (props: ErrorBoundaryProps) => (
  <main>
    <RouteError
      {...props}
      className="min-h-dvh justify-center"
      description="An unexpected error occurred. Please try again. If it keeps happening, refresh the page or come back in a few minutes."
      report={reportError}
    />
  </main>
);

export default AppRouteError;
