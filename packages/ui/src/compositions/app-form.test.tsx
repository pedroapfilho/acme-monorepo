import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { AppForm, SubmitButton, useAppForm } from "./app-form";

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

type HarnessProps = {
  isPending?: boolean;
  onSubmit?: (values: Values) => Promise<void>;
  validator?: typeof schema;
};

const submitNothing = () => Promise.resolve();

const Harness = ({
  isPending = false,
  onSubmit = submitNothing,
  validator = schema,
}: HarnessProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { form, requiredFields } = useAppForm({
    defaultValues: { confirmPassword: "", email: "", password: "" },
    onChange: () => {
      setErrorMessage(null);
    },
    onSubmit,
    onValidatorError: (error) => {
      setErrorMessage(error.message);
    },
    schema: validator,
  });

  return (
    <AppForm
      submission={{
        errorMessage,
        formId: form.formId,
        isPending,
        requiredFields,
        submit: () => form.handleSubmit(),
      }}
    >
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
      <SubmitButton pendingLabel="Saving…">Save</SubmitButton>
    </AppForm>
  );
};

const optionalSchema = z.object({ email: z.email(), name: z.string().optional() });
const optionalDefaults: z.input<typeof optionalSchema> = { email: "", name: "" };

const OptionalFieldHarness = () => {
  const { form, requiredFields } = useAppForm({
    defaultValues: optionalDefaults,
    onChange: () => undefined,
    onSubmit: submitNothing,
    onValidatorError: () => undefined,
    schema: optionalSchema,
  });

  return (
    <AppForm
      submission={{
        errorMessage: null,
        formId: form.formId,
        isPending: false,
        requiredFields,
        submit: () => form.handleSubmit(),
      }}
    >
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

const submit = async () => {
  const form = screen.getByRole("button", { name: "Save" }).closest("form");

  if (form === null) {
    throw new Error("AppForm did not render a <form>");
  }

  fireEvent.submit(form);
  await settle();
};

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
    const onSubmit = vi.fn<(values: Values) => Promise<void>>(() => Promise.resolve());
    render(<Harness onSubmit={onSubmit} />);
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
    expect(onSubmit).not.toHaveBeenCalled();
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
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
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

  it("hands a throwing validator to the caller instead of focusing a field", async () => {
    const throwing = schema.clone();
    render(<Harness validator={throwing} />);
    vi.spyOn(throwing["~standard"], "validate").mockImplementationOnce(() => {
      throw new Error("validator exploded");
    });

    await submit();

    await waitFor(() => {
      expect(document.querySelector('[data-slot="form-alert"]')?.textContent).toBe(
        "validator exploded",
      );
    });
  });

  it("disables the fields and shows the pending label while the submission is pending", () => {
    render(<Harness isPending />);

    const button = screen.getByRole("button", { name: "Saving…" });
    expect(button.matches(":disabled")).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByLabelText("Email").matches(":disabled")).toBe(true);
  });
});
