"use client";

import { log } from "@repo/observability";
import NextError from "next/error";
import { useEffect } from "react";

const GlobalError = ({ error }: { error: Error & { digest?: string } }) => {
  useEffect(() => {
    log.error({ error, message: "Global error boundary" });
  }, [error]);

  return (
    <html lang="en">
      <body>
        {/* The App Router does not expose a status code to global-error, so pass
        0 to render NextError's generic message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
};

export default GlobalError;
