import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createPasswordForm } from "./password-form";

const changePassword = vi.fn();
const refresh = vi.fn();
const showError = vi.fn();
const showSuccess = vi.fn();
const PasswordForm = createPasswordForm({
  changePassword,
  showError: (message) => {
    showError(message);
  },
  showSuccess: (message) => {
    showSuccess(message);
  },
  useAppRouter: () => ({
    back: () => {},
    bfcacheId: "test",
    forward: () => {},
    prefetch: () => {},
    push: () => {},
    refresh: () => {
      refresh();
    },
    replace: () => {},
  }),
});

const tick = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });

const renderForm = () => {
  const { container } = render(<PasswordForm />);
  const form = container.querySelector("form");
  if (form === null) {
    throw new Error("PasswordForm did not render a <form>");
  }
  return form;
};

const fillValidPasswords = () => {
  fireEvent.change(screen.getByLabelText("Current password"), {
    target: { value: "old-password-123" },
  });
  fireEvent.change(screen.getByLabelText("New password"), {
    target: { value: "new-password-456" },
  });
  fireEvent.change(screen.getByLabelText("Confirm new password"), {
    target: { value: "new-password-456" },
  });
};

const submitEvent = () => new Event("submit", { bubbles: true, cancelable: true });

const submitOnce = async (form: HTMLFormElement) => {
  await act(async () => {
    form.dispatchEvent(submitEvent());
    await tick();
  });
};

const submitTwiceInOneFrame = async (form: HTMLFormElement) => {
  await act(async () => {
    form.dispatchEvent(submitEvent());
    form.dispatchEvent(submitEvent());
    await tick();
  });
};

describe("PasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    changePassword.mockResolvedValue({ data: {}, error: null });
  });

  it("changes the password with other sessions revoked", async () => {
    const form = renderForm();
    fillValidPasswords();

    await submitOnce(form);

    expect(changePassword).toHaveBeenCalledWith({
      currentPassword: "old-password-123",
      newPassword: "new-password-456",
      revokeOtherSessions: true,
    });
    expect(showSuccess).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("submits once when the form is submitted twice within the same frame", async () => {
    const form = renderForm();
    fillValidPasswords();

    await submitTwiceInOneFrame(form);

    expect(changePassword).toHaveBeenCalledTimes(1);
  });

  it("does not submit when the new passwords do not match", async () => {
    const form = renderForm();
    fillValidPasswords();
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "different-pass-789" },
    });

    await submitOnce(form);

    expect(changePassword).not.toHaveBeenCalled();
  });

  it("shows the API error and submits again after a failed attempt", async () => {
    changePassword.mockResolvedValue({
      data: null,
      error: { code: "INVALID_PASSWORD", message: "Invalid password" },
    });
    const form = renderForm();
    fillValidPasswords();

    await submitOnce(form);
    await submitOnce(form);

    expect(showError).toHaveBeenCalledWith("Invalid password");
    expect(changePassword).toHaveBeenCalledTimes(2);
    expect(refresh).not.toHaveBeenCalled();
  });
});
