"use client";

import { useEffect } from "react";

import { log } from "@/lib/observability-client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// global-error replaces the root layout, so globals.css never loads here and Tailwind
// classes would resolve to nothing. Every rule below has to be inline.
const styles = {
  body: {
    alignItems: "center",
    backgroundColor: "light-dark(#ffffff, #0a0a0a)",
    color: "light-dark(#0a0a0a, #fafafa)",
    display: "flex",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    justifyContent: "center",
    margin: 0,
    minHeight: "100vh",
    padding: "1.5rem",
  },
  button: {
    backgroundColor: "light-dark(#0a0a0a, #fafafa)",
    border: "none",
    borderRadius: "0.5rem",
    color: "light-dark(#fafafa, #0a0a0a)",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 500,
    minHeight: "2.75rem",
    padding: "0.625rem 1.25rem",
  },
  digest: {
    color: "light-dark(#71717a, #a1a1aa)",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "0.75rem",
    margin: 0,
  },
  heading: {
    fontSize: "1.5rem",
    fontWeight: 600,
    margin: 0,
  },
  main: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    maxWidth: "28rem",
    textAlign: "center",
  },
  text: {
    color: "light-dark(#52525b, #a1a1aa)",
    fontSize: "0.875rem",
    lineHeight: 1.6,
    margin: 0,
  },
} as const;

const GlobalError = ({ error, reset }: GlobalErrorProps) => {
  useEffect(() => {
    log.error({ digest: error.digest, error: error.message, message: "Global error boundary" });
  }, [error]);

  return (
    <html lang="en" style={{ colorScheme: "light dark" }}>
      <body style={styles.body}>
        <main id="main-content" style={styles.main}>
          <h1 style={styles.heading}>Something went wrong</h1>
          <p style={styles.text}>
            The application stopped unexpectedly. Try again, and if the problem continues, reload
            the page or come back in a few minutes.
          </p>
          <button onClick={reset} style={styles.button} type="button">
            Try again
          </button>
          {error.digest !== undefined && <p style={styles.digest}>Reference: {error.digest}</p>}
        </main>
      </body>
    </html>
  );
};

export default GlobalError;
