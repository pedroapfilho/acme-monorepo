import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { respondToAuthRequests } from "@/lib/test-helpers";

import { EmailForm } from "./email-form";

it("sends the confirmation to the current address", async () => {
  const requests = respondToAuthRequests(200, { status: true });
  render(<EmailForm currentEmail="current@example.com" />);

  fireEvent.change(screen.getByLabelText("New email"), { target: { value: "new@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Update email" }));

  expect(await screen.findByText("Confirm the change")).not.toBeNull();
  expect(screen.getByText("current@example.com")).not.toBeNull();
  expect(requests).toStrictEqual([
    {
      body: { callbackURL: "/dashboard/settings", newEmail: "new@example.com" },
      path: "/api/auth/change-email",
    },
  ]);
});
