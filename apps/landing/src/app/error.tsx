"use client";

import { RouteError } from "@repo/ui/compositions/route-error";
import type { ErrorBoundaryProps } from "@repo/ui/hooks/use-error-report";

import { reportError } from "@/lib/observability-client";

const AppRouteError = (props: ErrorBoundaryProps) => (
  <RouteError
    {...props}
    className="py-24 md:py-32"
    description="This page failed to load. Try again, and if it keeps happening, come back in a few minutes."
    report={reportError}
  />
);

export default AppRouteError;
