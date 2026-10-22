import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FormAlert } from "./form-alert";

afterEach(cleanup);

describe("FormAlert", () => {
  it("announces a submit failure", () => {
    render(<FormAlert message="Invalid credentials" />);

    expect(screen.getByRole("alert").textContent).toBe("Invalid credentials");
  });

  it("renders nothing without a message", () => {
    render(<FormAlert message={null} />);

    expect(screen.queryByRole("alert")).toBeNull();
  });
});
