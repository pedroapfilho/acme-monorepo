import { useForm } from "@tanstack/react-form";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { AuthForm, AuthFormField, AuthFormRootError, AuthFormSubmit } from "./auth-form-fields";

type Values = { email: string; password: string };

// Test harness that mirrors how callers consume the deepened module: a real
// useForm() instance + the wrapper components. Each test exercises the
// rendering contract through the public interface — no internal mocking.
const Harness = ({
  children,
}: {
  children: (form: ReturnType<typeof useForm<Values>>) => ReactNode;
}) => {
  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async () => {},
  });
  return <>{children(form)}</>;
};

describe("AuthFormField", () => {
  it("renders label, input, and links them via id/htmlFor", () => {
    render(
      <Harness>
        {(form) => <AuthFormField form={form} label="Email" name="email" type="email" />}
      </Harness>,
    );

    const input = screen.getByLabelText("Email");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("id", "email");
    expect(input).toHaveAttribute("name", "email");
  });

  it("forwards placeholder", () => {
    render(
      <Harness>
        {(form) => (
          <AuthFormField
            form={form}
            label="Email"
            name="email"
            placeholder="you@example.com"
            type="email"
          />
        )}
      </Harness>,
    );

    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });

  it("disables the input when disabled is true", () => {
    render(
      <Harness>
        {(form) => <AuthFormField disabled form={form} label="Email" name="email" />}
      </Harness>,
    );

    expect(screen.getByLabelText("Email")).toBeDisabled();
  });

  it("does not mark the field aria-invalid before user interaction", () => {
    render(<Harness>{(form) => <AuthFormField form={form} label="Email" name="email" />}</Harness>);

    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "false");
  });

  it("renders the labelSlot next to the label when provided", () => {
    render(
      <Harness>
        {(form) => (
          <AuthFormField
            form={form}
            label="Password"
            labelSlot={<span data-testid="forgot-slot">Forgot?</span>}
            name="password"
            type="password"
          />
        )}
      </Harness>,
    );

    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByTestId("forgot-slot")).toBeInTheDocument();
  });

  it("propagates user input back to the form's field state", () => {
    render(
      <Harness>
        {(form) => <AuthFormField form={form} label="Email" name="email" type="email" />}
      </Harness>,
    );

    const input = screen.getByLabelText("Email");
    fireEvent.change(input, { target: { value: "user@example.com" } });

    expect(input).toHaveValue("user@example.com");
  });
});

describe("AuthFormRootError", () => {
  it("renders nothing when message is null", () => {
    const { container } = render(<AuthFormRootError message={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the message when provided", () => {
    render(<AuthFormRootError message="Invalid credentials" />);
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });
});

describe("AuthFormSubmit", () => {
  it("renders the label and stays enabled when not loading", () => {
    render(<AuthFormSubmit isLoading={false} label="Sign in" loadingLabel="Signing in..." />);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Sign in");
    expect(button).not.toBeDisabled();
  });

  it("renders the loading label and becomes disabled when loading", () => {
    render(<AuthFormSubmit isLoading label="Sign in" loadingLabel="Signing in..." />);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Signing in...");
    expect(button).toBeDisabled();
  });
});

describe("AuthForm", () => {
  it("submits the wrapped form and invokes the form's onSubmit", async () => {
    const onSubmit = vi.fn(async () => {});

    const TestForm = () => {
      const form = useForm({
        defaultValues: { email: "" },
        onSubmit,
      });
      return (
        <AuthForm form={form}>
          <button type="submit">Submit</button>
        </AuthForm>
      );
    };

    render(<TestForm />);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    // form.handleSubmit() is async — wait for the spy to resolve rather than
    // racing microtasks.
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
