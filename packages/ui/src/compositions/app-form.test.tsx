import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { useAppForm } from "../hooks/use-app-form";
import type { SubmissionFailure } from "../hooks/use-submission";

import { AppForm, SubmitButton } from "./app-form";

type Values = { confirmPassword: string; email: string; password: string };

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

type Run = (values: Values) => Promise<SubmissionFailure | null>;

const succeed: Run = () => Promise.resolve(null);

const onUnexpectedError = vi.fn<(cause: unknown) => void>();

const Harness = ({
  run = succeed,
  validator = schema,
}: {
  run?: Run;
  validator?: typeof schema;
}) => {
  const { errorCode, form, submission } = useAppForm({
    defaultValues: { confirmPassword: "", email: "", password: "" },
    onUnexpectedError,
    run,
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
      {errorCode !== null && <p>Code {errorCode}</p>}
      <SubmitButton pendingLabel="Saving…">Save</SubmitButton>
    </AppForm>
  );
};

const optionalSchema = z.object({ email: z.email(), name: z.string().optional() });
const optionalDefaults: z.input<typeof optionalSchema> = { email: "", name: "" };

const OptionalFieldHarness = () => {
  const { form, submission } = useAppForm({
    defaultValues: optionalDefaults,
    onUnexpectedError,
    run: () => Promise.resolve(null),
    schema: optionalSchema,
  });

  return (
    <AppForm submission={submission}>
      <form.AppField name="email">
        {(field) => <field.TextField autoComplete="email" label="Email" type="email" />}
      </form.AppField>
      <form.AppField name="name">
        {(field) => <field.TextField autoComplete="name" label="Name" />}
      </form.AppField>
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
  onUnexpectedError.mockReset();
});

describe("useAppForm", () => {
  it("derives required and optional accessibility states from the schema", () => {
    render(<OptionalFieldHarness />);

    expect(screen.getByLabelText("Email").getAttribute("aria-required")).toBe("true");
    expect(screen.getByLabelText("Name").getAttribute("aria-required")).toBe("false");
    expect(screen.getByLabelText<HTMLInputElement>("Email").required).toBe(false);
    expect(screen.getByLabelText<HTMLInputElement>("Name").required).toBe(false);
  });

  it("renders each field as a labelled input, a text input unless told otherwise", () => {
    const { unmount } = render(<OptionalFieldHarness />);
    expect(screen.getByLabelText<HTMLInputElement>("Name").type).toBe("text");
    unmount();
    render(<Harness />);

    const email = screen.getByLabelText<HTMLInputElement>("Email");
    const confirm = screen.getByLabelText<HTMLInputElement>("Confirm password");
    expect(email.type).toBe("email");
    expect(email.autocomplete).toBe("email");
    expect(confirm.type).toBe("password");
    expect(confirm.autocomplete).toBe("new-password");
    expect(confirm.id).toBe("confirm");
    expect(confirm.name).toBe("confirmPassword");
  });

  it("shows no error before submit, then revalidates every change after a failed submit", async () => {
    const run = vi.fn<Run>(succeed);
    render(<Harness run={run} />);
    type("Email", "not-an-email");
    fireEvent.blur(screen.getByLabelText("Email"));
    type("Password", "c");
    fireEvent.blur(screen.getByLabelText("Password"));
    await settle();
    expect(screen.queryByText("Invalid email")).toBeNull();
    expect(screen.queryByText("Too short")).toBeNull();
    expect(screen.getByLabelText("Email").getAttribute("aria-invalid")).toBe("false");
    expect(screen.getByRole("button", { name: "Save" }).matches(":disabled")).toBe(false);

    await submit();

    expect(await screen.findByText("Invalid email")).not.toBeNull();
    expect(screen.getByText("Too short")).not.toBeNull();
    const email = screen.getByLabelText("Email");
    expect(run).not.toHaveBeenCalled();
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(email.getAttribute("aria-describedby")).toBe("email-error");
    expect(screen.getByText("Invalid email").getAttribute("id")).toBe("email-error");
    expect(screen.getByRole("button", { name: "Save" }).matches(":disabled")).toBe(false);

    type("Email", "user@example.com");
    await waitFor(() => {
      expect(screen.queryByText("Invalid email")).toBeNull();
    });
    expect(screen.getByText("Too short")).not.toBeNull();

    type("Password", "correct-horse-battery");
    type("Confirm password", "correct-horse-staple");
    expect(await screen.findByText("Passwords do not match")).not.toBeNull();

    type("Password", "correct-horse-staple");
    await waitFor(() => {
      expect(screen.queryByText("Passwords do not match")).toBeNull();
    });

    await submit();
    await waitFor(() => {
      expect(run).toHaveBeenCalledExactlyOnceWith({
        confirmPassword: "correct-horse-staple",
        email: "user@example.com",
        password: "correct-horse-staple",
      });
    });
  });

  it("keeps an error that is still wrong after the next keystroke", async () => {
    render(<Harness />);
    type("Password", "c");
    await submit();
    expect(await screen.findByText("Too short")).not.toBeNull();

    type("Password", "co");
    await settle();

    expect(screen.getByText("Too short")).not.toBeNull();
  });

  it("describes a field by its helper text from the start, and by its error after submit", async () => {
    render(<Harness />);
    const password = screen.getByLabelText("Password");
    expect(screen.getByText("At least 12 characters.").getAttribute("id")).toBe(
      "password-description",
    );
    expect(password.getAttribute("aria-describedby")).toBe("password-description");

    await submit();

    await waitFor(() => {
      expect(password.getAttribute("aria-describedby")).toBe("password-description password-error");
    });
  });

  it("moves focus to the first invalid field on a failed submit", async () => {
    render(<Harness />);
    type("Email", "user@example.com");

    await submit();

    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByLabelText("Password"));
    });
  });

  it("reports a throwing validator and stays submittable", async () => {
    const throwingOnce = schema.clone();
    const run = vi.fn<Run>(succeed);
    render(<Harness run={run} validator={throwingOnce} />);
    fillValid();
    await settle();
    const thrown = new Error("validator exploded");
    vi.spyOn(throwingOnce["~standard"], "validate").mockImplementationOnce(() => {
      throw thrown;
    });

    await submit();

    await waitFor(() => {
      expect(formAlertText()).toMatch(/try again/v);
    });
    expect(onUnexpectedError).toHaveBeenCalledWith(thrown);
    expect(run).not.toHaveBeenCalled();

    await submit();
    await waitFor(() => {
      expect(run).toHaveBeenCalledOnce();
    });
  });

  it("runs once when submitted twice in the same frame", async () => {
    const run = vi.fn<Run>(succeed);
    render(<Harness run={run} />);
    fillValid();

    await submit(2);

    await waitFor(() => {
      expect(run).toHaveBeenCalledOnce();
    });
  });

  it("disables the fields and shows the pending label while the run is pending", async () => {
    const pending = Promise.withResolvers<SubmissionFailure | null>();
    render(<Harness run={() => pending.promise} />);
    fillValid();

    await submit();

    const button = await screen.findByRole("button", { name: "Saving…" });
    expect(button.matches(":disabled")).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByLabelText("Email").matches(":disabled")).toBe(true);

    pending.resolve(null);
    await settle();

    const idleButton = await screen.findByRole("button", { name: "Save" });
    expect(idleButton.matches(":disabled")).toBe(false);
    expect(screen.getByLabelText("Email").matches(":disabled")).toBe(false);
  });

  it("shows a failure in the form alert, clears it on change, then retries", async () => {
    const run = vi
      .fn<Run>()
      .mockResolvedValueOnce({ code: "TAKEN", message: "That email is taken" })
      .mockResolvedValueOnce(null);

    render(<Harness run={run} />);
    fillValid();

    await submit();

    await waitFor(() => {
      expect(formAlertText()).toBe("That email is taken");
    });
    expect(screen.getByText("Code TAKEN")).not.toBeNull();

    type("Email", "other@example.com");
    expect(formAlertText()).toBeNull();
    expect(screen.queryByText("Code TAKEN")).toBeNull();

    await submit();

    await waitFor(() => {
      expect(run).toHaveBeenCalledTimes(2);
    });
    expect(formAlertText()).toBeNull();
  });

  it("leaves a failure without a message to the caller", async () => {
    render(<Harness run={() => Promise.resolve({ code: "UNVERIFIED", message: null })} />);
    fillValid();

    await submit();

    expect(await screen.findByText("Code UNVERIFIED")).not.toBeNull();
    expect(formAlertText()).toBeNull();
  });

  it("reports a thrown run with the generic message", async () => {
    const thrown = new TypeError("Failed to fetch");
    render(<Harness run={() => Promise.reject(thrown)} />);
    fillValid();

    await submit();

    await waitFor(() => {
      expect(formAlertText()).toMatch(/try again/v);
    });
    expect(onUnexpectedError).toHaveBeenCalledWith(thrown);
  });
});
