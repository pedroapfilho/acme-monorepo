"use client";

import { GlobalError } from "@repo/ui/compositions/global-error";
import styles from "@repo/ui/compositions/global-error.module.css";
import type { ErrorBoundaryProps } from "@repo/ui/compositions/route-error";

import { reportError } from "@/lib/observability-client";

const AppGlobalError = (props: ErrorBoundaryProps) => (
  <html className={styles.document} lang="en">
    <body className={styles.body}>
      <GlobalError
        {...props}
        description="The application stopped unexpectedly. Try again, and if the problem continues, reload the page or come back in a few minutes."
        report={reportError}
      />
    </body>
  </html>
);

export default AppGlobalError;
