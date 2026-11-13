import { useEffect, useRef } from "react";

type BoundaryError = Error & { digest?: string };

type ErrorBoundaryProps = {
  error: BoundaryError;
  retry: () => void;
};

type ReportError = (error: BoundaryError) => void;

const useErrorReport = (error: BoundaryError, report: ReportError) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    report(error);
    headingRef.current?.focus();
  }, [error, report]);

  return headingRef;
};

export { useErrorReport };

export type { BoundaryError, ErrorBoundaryProps, ReportError };
