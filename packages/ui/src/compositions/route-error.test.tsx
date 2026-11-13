import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { GlobalError } from "./global-error";
import { RouteError } from "./route-error";

const error = Object.assign(new Error("Render failed"), { digest: "abc123" });

describe("RouteError", () => {
  it("reports the error, focuses the heading and retries", () => {
    const report = vi.fn<(reported: Error) => void>();
    const retry = vi.fn<() => void>();
    render(<RouteError description="Try again." error={error} report={report} retry={retry} />);

    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: "Something went wrong" }),
    );
    expect(screen.getByText("Reference: abc123").tagName).toBe("P");
    expect(report).toHaveBeenCalledExactlyOnceWith(error);

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});

describe("GlobalError", () => {
  it("renders its own title and main landmark in place of the root layout", () => {
    const markup = renderToStaticMarkup(
      <GlobalError
        description="Try again."
        error={error}
        report={vi.fn<(reported: Error) => void>()}
        retry={vi.fn<() => void>()}
      />,
    );

    expect(markup).toMatch(/^<title>Something went wrong<\/title><main /v);
    expect(markup).toContain("Reference: abc123");
  });
});
