import { fireEvent, screen } from "@testing-library/react";
import { toast } from "sonner";
import { expect, it, vi } from "vitest";

import { renderWithRouter, respondToAuthRequests } from "@/lib/test-helpers";

import LoginForm from "./form";

it("asks for email verification instead of reporting an unverified sign-in as an error", async () => {
  const showToast = vi.spyOn(toast, "error");
  respondToAuthRequests(403, { code: "EMAIL_NOT_VERIFIED", message: "Email not verified" });
  const router = renderWithRouter(<LoginForm searchParams={Promise.resolve({})} />);

  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@example.com" } });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "correct-horse-battery" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

  expect(
    await screen.findByText("This email isn't verified yet. We just sent you a new link."),
  ).not.toBeNull();
  expect(showToast).not.toHaveBeenCalled();
  expect(router.push).not.toHaveBeenCalled();
});
