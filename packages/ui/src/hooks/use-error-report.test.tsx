import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { useErrorReport } from "./use-error-report";
import type { BoundaryError, ReportError } from "./use-error-report";

const Boundary = ({ error, report }: { error: BoundaryError; report: ReportError }) => {
  const headingRef = useErrorReport(error, report);

  return (
    <h1 ref={headingRef} tabIndex={-1}>
      Something went wrong
    </h1>
  );
};

it("reports the error once and moves focus to the heading", () => {
  const error = new Error("Render failed");
  const report = vi.fn<ReportError>();
  const { rerender } = render(<Boundary error={error} report={report} />);

  expect(document.activeElement).toBe(screen.getByRole("heading"));

  rerender(<Boundary error={error} report={report} />);
  expect(report).toHaveBeenCalledExactlyOnceWith(error);
});
