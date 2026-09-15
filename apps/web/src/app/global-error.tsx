"use client";

import { useEffect } from "react";

import { log } from "@/lib/observability-client";

import styles from "./global-error.module.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const GlobalError = ({ error, reset }: GlobalErrorProps) => {
  useEffect(() => {
    log.error({ digest: error.digest, error: error.message, message: "Global error boundary" });
  }, [error]);

  return (
    <html className={styles.document} lang="en">
      <body className={styles.body}>
        <main className={styles.main} id="main-content">
          <h1 className={styles.heading}>Something went wrong</h1>
          <p className={styles.text}>
            The application stopped unexpectedly. Try again, and if the problem continues, reload
            the page or come back in a few minutes.
          </p>
          <button className={styles.button} onClick={reset} type="button">
            Try again
          </button>
          {error.digest !== undefined && <p className={styles.digest}>Reference: {error.digest}</p>}
        </main>
      </body>
    </html>
  );
};

export default GlobalError;
