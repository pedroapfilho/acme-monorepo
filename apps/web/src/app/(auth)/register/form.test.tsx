import { fireEvent, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { renderWithRouter, respondToAuthRequests } from "@/lib/test-helpers";

import RegisterForm from "./form";

it.each([null, ""])("asks for email verification when the session token is %s", async (token) => {
  const requests = respondToAuthRequests(200, { token, user: { id: "user-1" } });
  const router = renderWithRouter(
    <RegisterForm searchParams={Promise.resolve({ from: "/billing" })} />,
  );

  fireEvent.change(screen.getByLabelText("Full Name"), { target: { value: "Ada Lovelace" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@example.com" } });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "correct-horse-battery" },
  });
  fireEvent.change(screen.getByLabelText("Confirm Password"), {
    target: { value: "correct-horse-battery" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Create account" }));

  expect(await screen.findByText("Check your email")).not.toBeNull();
  expect(screen.getByText("ada@example.com")).not.toBeNull();
  expect(requests).toStrictEqual([
    {
      body: {
        callbackURL: "/billing",
        email: "ada@example.com",
        name: "Ada Lovelace",
        password: "correct-horse-battery",
      },
      path: "/api/auth/sign-up/email",
    },
  ]);
  expect(router.push).not.toHaveBeenCalled();
});
