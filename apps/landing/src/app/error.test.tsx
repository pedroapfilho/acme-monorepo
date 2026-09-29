import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { log } from "@/lib/observability-client";

import RouteError from "./error";
import GlobalError from "./global-error";

const error = Object.assign(new Error("Render failed"), { digest: "abc123" });

describe("RouteError", () => {
  it("reports the error, focuses the heading and retries", () => {
    const logError = vi.spyOn(log, "error").mockReturnValue(undefined);
    const retry = vi.fn<() => void>();
    render(<RouteError error={error} retry={retry} />);

    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: "Something went wrong." }),
    );
    expect(screen.getByText("Reference: abc123").tagName).toBe("P");
    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({ digest: "abc123", error: "Render failed" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});

describe("GlobalError", () => {
  it("renders its own document in place of the root layout", () => {
    const markup = renderToStaticMarkup(<GlobalError error={error} retry={vi.fn<() => void>()} />);

    expect(markup).toMatch(/^<html[^>]* lang="en-US"/);
    expect(markup).toContain("<title>Something went wrong</title>");
    expect(markup).toContain("Reference: abc123");
  });
});
