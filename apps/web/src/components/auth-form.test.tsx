import type { StandardSchemaV1 } from "@tanstack/react-form";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { log } from "@/lib/observability-client";

import { AuthActionButton, AuthForm, SubmitButton, useAuthForm } from "./auth-form";

const UNEXPECTED_ERROR = expect.stringMatching(/try again/v);

type Values = { confirmPassword: string; email: string; password: string };
type Result = {
  data: { id: string } | null;
  error: { code?: string; message?: string } | null;
};

const schema = z
  .object({
    confirmPassword: z.string(),
    email: z.email("Invalid email"),
    password: z.string().min(12, "Too short"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const call = vi.fn<(value: Values) => Promise<Result>>();
const onSuccess = vi.fn();
const showToast = vi.spyOn(toast, "error");
const logError = vi.spyOn(log, "error");

const succeed = (): Promise<Result> => Promise.resolve({ data: { id: "user-1" }, error: null });
const fail = (failure: { code?: string; message?: string }): Promise<Result> =>
  Promise.resolve({ data: null, error: failure });

const Harness = ({ validator = schema }: { validator?: StandardSchemaV1<Values, unknown> }) => {
  const { errorCode, form, submission } = useAuthForm({
    call,
    defaultValues: { confirmPassword: "", email: "", password: "" },
    fallbackError: "Request failed",
    handledErrorCodes: ["EMAIL_NOT_VERIFIED"],
    onSuccess,
    schema: validator,
  });

  return (
    <AuthForm submission={submission}>
      <form.AppField name="email">
        {(field) => <field.TextField autoComplete="email" label="Email" />}
      </form.AppField>
      <form.AppField name="password">
        {(field) => <field.TextField autoComplete="new-password" label="Password" />}
      </form.AppField>
      <form.AppField name="confirmPassword">
        {(field) => (
          <field.TextField autoComplete="new-password" id="confirm" label="Confirm password" />
        )}
      </form.AppField>
      {errorCode !== null && <p>Handled {errorCode}</p>}
      <SubmitButton pendingLabel="Saving…">Save</SubmitButton>
    </AuthForm>
  );
};

const settle = () =>
  act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });

const type = (label: string, value: string) => {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
};

const fillValid = () => {
  type("Email", "user@example.com");
  type("Password", "correct-horse-battery");
  type("Confirm password", "correct-horse-battery");
};

const submit = async (times = 1) => {
  const form = screen.getByRole("button", { name: /Save|Saving…/v }).closest("form");
  if (form === null) {
    throw new Error("AuthForm did not render a <form>");
  }
  for (let attempt = 0; attempt < times; attempt += 1) {
    fireEvent.submit(form);
  }
  await settle();
};

const liveRegionText = () =>
  document.querySelector('[aria-live="polite"][aria-atomic="true"]')?.textContent;

beforeEach(() => {
  call.mockReset();
  onSuccess.mockReset();
  showToast.mockClear();
  logError.mockReset();
  logError.mockImplementation(() => {});
});

describe("useAuthForm", () => {
  it("renders each field as a labelled input typed by its autocomplete purpose", () => {
    render(<Harness />);

    const email = screen.getByLabelText<HTMLInputElement>("Email");
    const confirm = screen.getByLabelText<HTMLInputElement>("Confirm password");
    expect(email.type).toBe("email");
    expect(email.autocomplete).toBe("email");
    expect(email.getAttribute("aria-required")).toBe("true");
    expect(email.required).toBe(false);
    expect(confirm.type).toBe("password");
    expect(confirm.autocomplete).toBe("new-password");
    expect(confirm.id).toBe("confirm");
    expect(confirm.name).toBe("confirmPassword");
  });

  it("validates on submit, then revalidates every change", async () => {
    render(<Harness />);
    type("Email", "not-an-email");
    expect(screen.queryByRole("alert")).toBeNull();

    await submit();

    const email = screen.getByLabelText("Email");
    expect(call).not.toHaveBeenCalled();
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(email.getAttribute("aria-describedby")).toBe("email-error");
    expect(screen.getByText("Invalid email").getAttribute("id")).toBe("email-error");

    type("Email", "user@example.com");
    expect(screen.queryByText("Invalid email")).toBeNull();

    type("Password", "correct-horse-battery");
    type("Confirm password", "correct-horse-staple");
    expect(screen.getByText("Passwords do not match")).not.toBeNull();

    type("Password", "correct-horse-staple");
    expect(screen.queryByText("Passwords do not match")).toBeNull();

    call.mockImplementation(succeed);
    await submit();
    expect(call).toHaveBeenCalledWith({
      confirmPassword: "correct-horse-staple",
      email: "user@example.com",
      password: "correct-horse-staple",
    });
  });

  it("calls once when submitted twice in the same frame", async () => {
    call.mockImplementation(succeed);
    render(<Harness />);
    fillValid();

    await submit(2);

    expect(call).toHaveBeenCalledTimes(1);
  });

  it("disables the form and shows the pending label while the call runs", async () => {
    const pending = Promise.withResolvers<Result>();
    call.mockReturnValue(pending.promise);
    render(<Harness />);
    fillValid();

    await submit();

    const button = screen.getByRole("button", { name: "Saving…" });
    expect(button.matches(":disabled")).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByLabelText("Email").matches(":disabled")).toBe(true);

    pending.resolve({ data: { id: "user-1" }, error: null });
    await settle();

    expect(screen.getByRole("button", { name: "Save" }).matches(":disabled")).toBe(false);
    expect(screen.getByLabelText("Email").matches(":disabled")).toBe(false);
  });

  it("runs onSuccess with the response data and the submitted values", async () => {
    call.mockImplementation(succeed);
    render(<Harness />);
    fillValid();

    await submit();

    expect(onSuccess).toHaveBeenCalledWith(
      { id: "user-1" },
      {
        confirmPassword: "correct-horse-battery",
        email: "user@example.com",
        password: "correct-horse-battery",
      },
    );
    expect(showToast).not.toHaveBeenCalled();
    expect(liveRegionText()).toBe("");
  });

  it("reports the Better Auth message in a toast and the live region, then retries", async () => {
    call.mockImplementationOnce(() =>
      fail({ code: "INVALID_PASSWORD", message: "Invalid password" }),
    );
    call.mockImplementationOnce(succeed);
    render(<Harness />);
    fillValid();

    await submit();

    expect(showToast).toHaveBeenCalledWith("Invalid password");
    expect(liveRegionText()).toBe("Invalid password");
    expect(onSuccess).not.toHaveBeenCalled();

    await submit();

    expect(call).toHaveBeenCalledTimes(2);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(liveRegionText()).toBe("");
  });

  it("falls back to the form's message when Better Auth sends none", async () => {
    call.mockImplementation(() => fail({ code: "UNKNOWN" }));
    render(<Harness />);
    fillValid();

    await submit();

    expect(showToast).toHaveBeenCalledWith("Request failed");
    expect(liveRegionText()).toBe("Request failed");
  });

  it("reports a thrown call with the generic message and logs it", async () => {
    call.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    call.mockImplementationOnce(succeed);
    render(<Harness />);
    fillValid();

    await submit();

    expect(showToast).toHaveBeenCalledWith(UNEXPECTED_ERROR);
    expect(logError).toHaveBeenCalledWith(expect.objectContaining({ error: "Failed to fetch" }));

    await submit();
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("stays submittable after a validator throws", async () => {
    let shouldThrow = true;
    const throwingOnce: StandardSchemaV1<Values, unknown> = {
      "~standard": {
        validate: (value) => {
          if (shouldThrow) {
            shouldThrow = false;
            throw new Error("validator exploded");
          }
          return { value };
        },
        vendor: "test",
        version: 1,
      },
    };
    call.mockImplementation(succeed);
    render(<Harness validator={throwingOnce} />);
    fillValid();

    await submit();

    expect(call).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(UNEXPECTED_ERROR);

    await submit();
    expect(call).toHaveBeenCalledTimes(1);
  });

  it("leaves handled error codes to the form without a toast", async () => {
    call.mockImplementationOnce(() =>
      fail({ code: "EMAIL_NOT_VERIFIED", message: "Email not verified" }),
    );
    call.mockImplementationOnce(() => fail({ message: "Invalid credentials" }));
    render(<Harness />);
    fillValid();

    await submit();

    expect(screen.getByText("Handled EMAIL_NOT_VERIFIED")).not.toBeNull();
    expect(showToast).not.toHaveBeenCalled();
    expect(liveRegionText()).toBe("");

    await submit();

    expect(screen.queryByText("Handled EMAIL_NOT_VERIFIED")).toBeNull();
    expect(showToast).toHaveBeenCalledWith("Invalid credentials");
  });
});

describe("AuthActionButton", () => {
  const action = vi.fn<() => Promise<Result>>();
  const onDone = vi.fn();

  const renderButton = () => {
    render(
      <AuthActionButton
        call={action}
        fallbackError="Failed to sign out"
        onSuccess={onDone}
        pendingLabel="Signing out…"
      >
        Sign out
      </AuthActionButton>,
    );
    return screen.getByRole("button", { name: "Sign out" });
  };

  beforeEach(() => {
    action.mockReset();
    onDone.mockReset();
  });

  it("runs once per burst of clicks and reports the outcome", async () => {
    action.mockImplementationOnce(() => fail({}));
    action.mockImplementationOnce(succeed);
    const button = renderButton();

    fireEvent.click(button);
    fireEvent.click(button);
    await settle();

    expect(action).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledWith("Failed to sign out");
    expect(liveRegionText()).toBe("Failed to sign out");
    expect(onDone).not.toHaveBeenCalled();

    fireEvent.click(button);
    await settle();

    expect(action).toHaveBeenCalledTimes(2);
    expect(onDone).toHaveBeenCalledWith({ id: "user-1" }, undefined);
    expect(liveRegionText()).toBe("");
  });

  it("shows the pending label until the call settles", async () => {
    const pending = Promise.withResolvers<Result>();
    action.mockReturnValue(pending.promise);
    fireEvent.click(renderButton());
    await settle();

    expect(screen.getByRole("button", { name: "Signing out…" }).matches(":disabled")).toBe(true);

    pending.resolve({ data: { id: "user-1" }, error: null });
    await settle();

    expect(screen.getByRole("button", { name: "Sign out" }).matches(":disabled")).toBe(false);
  });

  it("reports a thrown call with the generic message", async () => {
    action.mockRejectedValue(new Error("network down"));
    fireEvent.click(renderButton());
    await settle();

    expect(showToast).toHaveBeenCalledWith(UNEXPECTED_ERROR);
    expect(screen.getByRole("button", { name: "Sign out" }).matches(":disabled")).toBe(false);
  });
});
