"use client";

import { useEffect, useRef } from "react";

import styles from "./global-error.module.css";
import type { ErrorReportProps } from "./route-error";

// Replaces the root layout, whose stylesheet never loads here, so the app's <html> and <body> take their classes from the same CSS module.
const GlobalError = ({ description, error, report, retry }: ErrorReportProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    report(error);
    headingRef.current?.focus();
  }, [error, report]);

  return (
    <>
      <title>Something went wrong</title>
      <main className={styles.main} id="main-content">
        <h1 className={styles.heading} ref={headingRef} tabIndex={-1}>
          Something went wrong
        </h1>
        <p className={styles.text}>{description}</p>
        <button className={styles.button} onClick={retry} type="button">
          Try again
        </button>
        {error.digest !== undefined && <p className={styles.digest}>Reference: {error.digest}</p>}
      </main>
    </>
  );
};

export { GlobalError };
