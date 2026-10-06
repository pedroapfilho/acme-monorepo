import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

const optionalSchema = z.object({ email: z.email(), name: z.string().optional() });
const optionalDefaults: z.input<typeof optionalSchema> = { email: "", name: "" };

const OptionalFieldHarness = () => {
  const { form, submission } = useAuthForm({
    call: succeed,
    defaultValues: optionalDefaults,
    fallbackError: "Request failed",
    schema: optionalSchema,
  });
  return (
    <AuthForm submission={submission}>
      <form.AppField name="email">
        {(field) => <field.TextField autoComplete="email" label="Email" />}
      </form.AppField>
      <form.AppField name="name">
        {(field) => <field.TextField autoComplete="name" label="Name" />}
      </form.AppField>
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
  const button = await screen.findByRole("button", { name: "Save" });
  const form = button.closest("form");
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
  it("derives required and optional accessibility states from the schema", () => {
    render(<OptionalFieldHarness />);

    expect(screen.getByLabelText("Email").getAttribute("aria-required")).toBe("true");
    expect(screen.getByLabelText("Name").getAttribute("aria-required")).toBe("false");
    expect(screen.getByLabelText<HTMLInputElement>("Email").required).toBe(false);
    expect(screen.getByLabelText<HTMLInputElement>("Name").required).toBe(false);
  });

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

  it("validates on blur before submit, then clears errors on change without another blur", async () => {
    render(<Harness />);
    type("Email", "not-an-email");
    await settle();
    expect(screen.queryByRole("alert")).toBeNull();

    fireEvent.blur(screen.getByLabelText("Email"));
    expect(await screen.findByText("Invalid email")).not.toBeNull();

    await submit();

    expect(await screen.findByText("Too short")).not.toBeNull();
    const email = screen.getByLabelText("Email");
    expect(call).not.toHaveBeenCalled();
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(email.getAttribute("aria-describedby")).toBe("email-error");
    expect(screen.getByText("Invalid email").getAttribute("id")).toBe("email-error");

    type("Email", "user@example.com");
    await waitFor(() => {
      expect(screen.queryByText("Invalid email")).toBeNull();
    });

    type("Password", "correct-horse-battery");
    type("Confirm password", "correct-horse-staple");
    expect(await screen.findByText("Passwords do not match")).not.toBeNull();

    type("Password", "correct-horse-staple");
    await waitFor(() => {
      expect(screen.queryByText("Passwords do not match")).toBeNull();
    });

    call.mockImplementation(succeed);
    await submit();
    await waitFor(() => {
      expect(call).toHaveBeenCalledWith({
        confirmPassword: "correct-horse-staple",
        email: "user@example.com",
        password: "correct-horse-staple",
      });
    });
  });

  it("revalidates a fixed blur error on the first Enter submission", async () => {
    call.mockImplementation(succeed);
    render(<Harness />);
    fillValid();
    type("Email", "not-an-email");
    fireEvent.blur(screen.getByLabelText("Email"));
    expect(await screen.findByText("Invalid email")).not.toBeNull();

    type("Email", "user@example.com");
    await submit();

    await waitFor(() => {
      expect(call).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.queryByText("Invalid email")).toBeNull();
    });
  });

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

    await waitFor(() => {
      expect(liveRegionText()).toBe("Invalid password");
    });
    expect(showToast).toHaveBeenCalledWith("Invalid password");
    expect(onSuccess).not.toHaveBeenCalled();

    await submit();

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
    expect(call).toHaveBeenCalledTimes(2);
    expect(liveRegionText()).toBe("");
  });

  it("falls back to the form's message when Better Auth sends none", async () => {
    call.mockImplementation(() => fail({ code: "UNKNOWN" }));
    render(<Harness />);
    fillValid();

    await submit();

    await waitFor(() => {
      expect(liveRegionText()).toBe("Request failed");
    });
    expect(showToast).toHaveBeenCalledWith("Request failed");
  });

  it("reports a thrown call with the generic message and logs it", async () => {
    call.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    call.mockImplementationOnce(succeed);
    render(<Harness />);
    fillValid();

    await submit();

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(UNEXPECTED_ERROR);
    });
    expect(logError).toHaveBeenCalledWith(expect.objectContaining({ error: "Failed to fetch" }));

    await submit();
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("stays submittable after a validator throws", async () => {
    const throwingOnce = schema.clone();
    vi.spyOn(throwingOnce["~standard"], "validate").mockImplementationOnce(() => {
      throw new Error("validator exploded");
    });
    call.mockImplementation(succeed);
    render(<Harness validator={throwingOnce} />);
    fillValid();

    await submit();

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(UNEXPECTED_ERROR);
    });
    expect(logError).toHaveBeenCalledWith(expect.objectContaining({ error: "validator exploded" }));
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
      expect(showToast).toHaveBeenCalledWith(UNEXPECTED_ERROR);
    });
    expect(call).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({ error: "refinement exploded" }),
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
    expect(liveRegionText()).toBe("");
  });

  it("leaves handled error codes to the form without a toast", async () => {
    call.mockImplementationOnce(() =>
      fail({ code: "EMAIL_NOT_VERIFIED", message: "Email not verified" }),
    );
    call.mockImplementationOnce(() => fail({ message: "Invalid credentials" }));
    render(<Harness />);
    fillValid();

    await submit();

    expect(await screen.findByText("Handled EMAIL_NOT_VERIFIED")).not.toBeNull();
    expect(showToast).not.toHaveBeenCalled();
    expect(liveRegionText()).toBe("");

    await submit();

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith("Invalid credentials");
    });
    expect(screen.queryByText("Handled EMAIL_NOT_VERIFIED")).toBeNull();
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
