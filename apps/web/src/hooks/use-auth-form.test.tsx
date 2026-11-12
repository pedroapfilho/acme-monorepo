import { AppForm, SubmitButton } from "@repo/ui/compositions/app-form";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { useAuthForm } from "./use-auth-form";

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
const consoleError = vi.spyOn(console, "error");

const reportedErrors = () => consoleError.mock.calls.flat();

const succeed = (): Promise<Result> => Promise.resolve({ data: { id: "user-1" }, error: null });

const fail = (failure: { code?: string; message?: string }): Promise<Result> =>
  Promise.resolve({ data: null, error: failure });

const Harness = ({ validator = schema }: { validator?: typeof schema }) => {
  const { errorCode, form, submission } = useAuthForm({
    call,
    defaultValues: { confirmPassword: "", email: "", password: "" },
    fallbackError: "Request failed",
    handledErrorCodes: ["EMAIL_NOT_VERIFIED"],
    onSuccess,
    schema: validator,
  });

  return (
    <AppForm submission={submission}>
      <form.AppField name="email">
        {(field) => <field.TextField autoComplete="email" label="Email" type="email" />}
      </form.AppField>
      <form.AppField name="password">
        {(field) => (
          <field.TextField
            autoComplete="new-password"
            description="At least 12 characters."
            label="Password"
            type="password"
          />
        )}
      </form.AppField>
      <form.AppField name="confirmPassword">
        {(field) => (
          <field.TextField
            autoComplete="new-password"
            id="confirm"
            label="Confirm password"
            type="password"
          />
        )}
      </form.AppField>
      {errorCode !== null && <p>Handled {errorCode}</p>}
      <SubmitButton pendingLabel="Saving…">Save</SubmitButton>
    </AppForm>
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
  const button = await screen.findByRole("button", { name: "Save" });
  const form = button.closest("form");

  if (form === null) {
    throw new Error("AppForm did not render a <form>");
  }

  for (let attempt = 0; attempt < times; attempt += 1) {
    fireEvent.submit(form);
  }

  await settle();
};

const formAlertText = () => document.querySelector('[data-slot="form-alert"]')?.textContent ?? null;

beforeEach(() => {
  call.mockReset();
  onSuccess.mockReset();
  consoleError.mockReset();
});

describe("useAuthForm", () => {
  it("calls once when submitted twice in the same frame", async () => {
    call.mockImplementation(succeed);
    render(<Harness />);
    fillValid();

    await submit(2);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
    expect(call).toHaveBeenCalledTimes(1);
  });

  it("disables the form and shows the pending label while the call runs", async () => {
    const pending = Promise.withResolvers<Result>();
    call.mockReturnValue(pending.promise);
    render(<Harness />);
    fillValid();

    await submit();

    const button = await screen.findByRole("button", { name: "Saving…" });
    expect(button.matches(":disabled")).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByLabelText("Email").matches(":disabled")).toBe(true);

    pending.resolve({ data: { id: "user-1" }, error: null });
    await settle();

    const idleButton = await screen.findByRole("button", { name: "Save" });
    expect(idleButton.matches(":disabled")).toBe(false);
    expect(screen.getByLabelText("Email").matches(":disabled")).toBe(false);
  });

  it("runs onSuccess with the response data and the submitted values", async () => {
    call.mockImplementation(succeed);
    render(<Harness />);
    fillValid();

    await submit();

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        { id: "user-1" },
        {
          confirmPassword: "correct-horse-battery",
          email: "user@example.com",
          password: "correct-horse-battery",
        },
      );
    });
    expect(formAlertText()).toBeNull();
  });

  it("reports the Better Auth message in the form alert, clears it on change, then retries", async () => {
    call.mockImplementationOnce(() =>
      fail({ code: "INVALID_PASSWORD", message: "Invalid password" }),
    );
    call.mockImplementationOnce(succeed);
    render(<Harness />);
    fillValid();

    await submit();

    await waitFor(() => {
      expect(formAlertText()).toBe("Invalid password");
    });
    expect(formAlertText()).toBe("Invalid password");
    expect(onSuccess).not.toHaveBeenCalled();

    type("Password", "correct-horse-staple");
    type("Confirm password", "correct-horse-staple");
    expect(formAlertText()).toBeNull();

    await submit();

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
    expect(call).toHaveBeenCalledTimes(2);
    expect(formAlertText()).toBeNull();
  });

  it("falls back to the form's message when Better Auth sends none", async () => {
    call.mockImplementation(() => fail({ code: "UNKNOWN" }));
    render(<Harness />);
    fillValid();

    await submit();

    await waitFor(() => {
      expect(formAlertText()).toBe("Request failed");
    });
    expect(formAlertText()).toBe("Request failed");
  });

  it("reports a thrown call with the generic message and logs it", async () => {
    call.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    call.mockImplementationOnce(succeed);
    render(<Harness />);
    fillValid();

    await submit();

    await waitFor(() => {
      expect(formAlertText()).toEqual(UNEXPECTED_ERROR);
    });
    expect(reportedErrors()).toContainEqual(
      expect.objectContaining({ message: "Failed to fetch" }),
    );

    await submit();
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("stays submittable after a validator throws", async () => {
    const throwingOnce = schema.clone();
    call.mockImplementation(succeed);
    render(<Harness validator={throwingOnce} />);
    fillValid();
    await settle();
    vi.spyOn(throwingOnce["~standard"], "validate").mockImplementationOnce(() => {
      throw new Error("validator exploded");
    });

    await submit();

    await waitFor(() => {
      expect(formAlertText()).toEqual(UNEXPECTED_ERROR);
    });
    expect(reportedErrors()).toContainEqual(
      expect.objectContaining({ message: "validator exploded" }),
    );
    expect(call).not.toHaveBeenCalled();

    await submit();
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
    expect(call).toHaveBeenCalledTimes(1);
  });

  it("recovers from a throwing Zod refinement and validates later edits", async () => {
    const throwingRefine = schema.refine((value) => {
      if (value.email === "user@example.com") {
        throw new Error("refinement exploded");
      }

      return true;
    });

    call.mockImplementation(succeed);
    render(<Harness validator={throwingRefine} />);
    fillValid();

    await submit();

    await waitFor(() => {
      expect(formAlertText()).toEqual(UNEXPECTED_ERROR);
    });
    expect(call).not.toHaveBeenCalled();
    expect(reportedErrors()).toContainEqual(
      expect.objectContaining({ message: "refinement exploded" }),
    );
    expect(screen.getByRole("button", { name: "Save" }).matches(":disabled")).toBe(false);

    type("Password", "another-valid-password");
    await settle();
    type("Password", "correct-horse-battery");
    await settle();

    type("Email", "not-an-email");
    expect(await screen.findByText("Invalid email")).not.toBeNull();
    type("Email", "fixed@example.com");
    await waitFor(() => {
      expect(screen.queryByText("Invalid email")).toBeNull();
    });
    await submit();

    await waitFor(() => {
      expect(call).toHaveBeenCalledTimes(1);
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(formAlertText()).toBeNull();
  });

  it("leaves handled error codes to the form without a form alert", async () => {
    call.mockImplementationOnce(() =>
      fail({ code: "EMAIL_NOT_VERIFIED", message: "Email not verified" }),
    );
    call.mockImplementationOnce(() => fail({ message: "Invalid credentials" }));
    render(<Harness />);
    fillValid();

    await submit();

    expect(await screen.findByText("Handled EMAIL_NOT_VERIFIED")).not.toBeNull();
    expect(formAlertText()).toBeNull();

    await submit();

    await waitFor(() => {
      expect(formAlertText()).toBe("Invalid credentials");
    });
    expect(screen.queryByText("Handled EMAIL_NOT_VERIFIED")).toBeNull();
  });
});
