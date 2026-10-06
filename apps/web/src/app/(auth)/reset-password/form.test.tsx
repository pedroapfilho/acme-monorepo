import { act, fireEvent, screen } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";

import { renderWithRouter, respondToAuthRequests } from "@/lib/test-helpers";

import ResetPasswordForm from "./form";

const renderForm = async (params: { error?: string; token?: string }) => {
  const searchParams = Promise.resolve(params);
  await act(async () => {
    renderWithRouter(<ResetPasswordForm searchParams={searchParams} />);
    await searchParams;
  });
};

const expectInvalidLinkState = () => {
  expect(screen.getByRole("heading", { name: "Reset link invalid" })).not.toBeNull();
  expect(screen.getByText("This password reset link is invalid or has expired.")).not.toBeNull();
  expect(screen.getByRole("link", { name: "Request a new link" }).getAttribute("href")).toBe(
    "/recover",
  );
  expect(screen.queryByLabelText("New password")).toBeNull();
};

describe("ResetPasswordForm", () => {
  it("offers a new link when the URL carries no token", async () => {
    await renderForm({});

    expectInvalidLinkState();
  });

  it("offers a new link when Better Auth rejected the token", async () => {
    await renderForm({ error: "INVALID_TOKEN" });

    expectInvalidLinkState();
  });

  it("offers a new link when Better Auth rejects the token on submit", async () => {
    const showToast = vi.spyOn(toast, "error");
    const requests = respondToAuthRequests(400, {
      code: "INVALID_TOKEN",
      message: "Invalid token",
    });
    await renderForm({ token: "expired-token" });

    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "correct-horse-battery" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "correct-horse-battery" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));

    expect(await screen.findByRole("heading", { name: "Reset link invalid" })).not.toBeNull();
    expectInvalidLinkState();
    expect(requests).toStrictEqual([
      {
        body: { newPassword: "correct-horse-battery", token: "expired-token" },
        path: "/api/auth/reset-password",
      },
    ]);
    expect(showToast).not.toHaveBeenCalled();
  });
});
