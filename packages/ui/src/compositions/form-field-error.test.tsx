import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FormFieldError } from "./form-field-error";

afterEach(cleanup);

describe("FormFieldError", () => {
  it("normalizes validator values and lets the registry deduplicate messages", () => {
    render(<FormFieldError errors={[null, undefined, "Required", { message: "Required" }, 42n]} />);

    expect(screen.getByRole("alert").textContent).toBe("Required42");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("keeps explicit error content and IDs available to accessible form controls", () => {
    render(<FormFieldError id="password-error">Choose a stronger password</FormFieldError>);

    expect(screen.getByRole("alert").id).toBe("password-error");
    expect(screen.getByRole("alert").textContent).toBe("Choose a stronger password");
  });

  it("renders no alert when validation has no errors", () => {
    render(<FormFieldError errors={[undefined, null]} />);

    expect(screen.queryByRole("alert")).toBeNull();
  });
});
