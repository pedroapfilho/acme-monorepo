import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ResetPasswordForm from "./form";

const renderForm = async (params: { error?: string; token?: string }) => {
  const searchParams = Promise.resolve(params);
  await act(async () => {
    render(<ResetPasswordForm searchParams={searchParams} />);
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
});
