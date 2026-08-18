import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createLoginForm } from "./form";

const push = vi.fn();
const refresh = vi.fn();
const signInEmail = vi.fn();
const toastError = vi.fn();
const LoginForm = createLoginForm({
  showError: (message) => {
    toastError(message);
  },
  signInEmail,
  useAppRouter: () => ({
    back: () => {},
    bfcacheId: "test",
    forward: () => {},
    prefetch: () => {},
    push: (href) => {
      push(href);
    },
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

const renderForm = async () => {
  const searchParams = Promise.resolve({});
  const { container } = await act(async () => {
    const rendered = render(<LoginForm searchParams={searchParams} />);
    await searchParams;
    return rendered;
  });

  const form = container.querySelector("form");
  if (form === null) {
    throw new Error("LoginForm did not render a <form>");
  }
  return form;
};

const fillValidCredentials = () => {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "user@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "correct-horse-battery" },
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

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInEmail.mockResolvedValue({ data: { token: "session-token" }, error: null });
  });

  it("signs in once when the form is submitted twice within the same frame", async () => {
    const form = await renderForm();
    fillValidCredentials();

    await submitTwiceInOneFrame(form);

    expect(signInEmail).toHaveBeenCalledTimes(1);
  });

  it("submits again after a failed attempt", async () => {
    signInEmail.mockResolvedValue({
      data: null,
      error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" },
    });
    const form = await renderForm();
    fillValidCredentials();

    await submitOnce(form);
    await submitOnce(form);

    expect(signInEmail).toHaveBeenCalledTimes(2);
  });

  it("submits after a rejected validation attempt is corrected", async () => {
    const form = await renderForm();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "short" } });

    await submitOnce(form);
    expect(signInEmail).not.toHaveBeenCalled();

    fillValidCredentials();
    await submitOnce(form);

    expect(signInEmail).toHaveBeenCalledTimes(1);
  });
});
