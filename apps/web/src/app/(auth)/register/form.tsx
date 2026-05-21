"use client";

import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  useFieldContext,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { toast } from "@repo/ui/components/sonner";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { registerSchema } from "@/lib/form-schemas";

type FieldInputProps = {
  autoComplete: string;
  errors: Array<unknown>;
  id: string;
  isInvalid: boolean;
  isLoading: boolean;
  name: string;
  onBlur: () => void;
  onChange: (v: string) => void;
  type?: string;
  value: string;
};

const RegisterFieldInput = ({
  autoComplete,
  errors,
  id,
  isInvalid,
  isLoading,
  name,
  onBlur,
  onChange,
  type = "text",
  value,
}: FieldInputProps) => {
  const { id: fieldId } = useFieldContext();
  return (
    <>
      <Input
        aria-describedby={isInvalid ? `${fieldId}-error` : undefined}
        aria-invalid={isInvalid}
        autoComplete={autoComplete}
        disabled={isLoading}
        id={id}
        name={name}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        required
        type={type}
        value={value}
      />
      {isInvalid && <FieldError errors={errors} />}
    </>
  );
};

const RegisterForm = () => {
  const { push, refresh } = useRouter();
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { confirmPassword: "", email: "", name: "", password: "" },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setFormError(null);
      try {
        if (value.password !== value.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const result = await authClient.signUp.email({
          email: value.email,
          name: value.name,
          password: value.password,
        });
        if (result.error) {
          throw new Error(result.error.message ?? "Failed to register");
        }
        // requireEmailVerification gates auto-sign-in: when active, Better Auth
        // returns the user but no session token. The dashboard middleware would
        // bounce the user back to /login (looking like silent failure), so show
        // a verification UI instead. The wording stays ambiguous so it's also
        // correct for the enumeration-prevention path (existing email →
        // synthetic-success). The real account holder gets a separate
        // notification email via emailAndPassword.onExistingUserSignUp.
        if (!result.data?.token) {
          setPendingVerificationEmail(value.email);
          return;
        }
        push("/dashboard");
        refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An error occurred. Please try again.";
        setFormError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    validators: { onSubmit: registerSchema },
  });

  if (pendingVerificationEmail) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-semibold">Check your email</p>
        <p className="text-sm text-muted-foreground">
          If <span className="font-medium text-foreground">{pendingVerificationEmail}</span> is new
          to acme, we&apos;ve sent a verification link. Click it to activate your account.
        </p>
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link className="text-foreground underline underline-offset-4" href="/login">
            Sign in
          </Link>{" "}
          or{" "}
          <Link className="text-foreground underline underline-offset-4" href="/recover">
            reset your password
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <div aria-atomic="true" aria-live="polite" className="sr-only">
        {formError}
      </div>
      <FieldGroup>
        <form.Field name="name">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <RegisterFieldInput
                  autoComplete="name"
                  errors={field.state.meta.errors}
                  id="name"
                  isInvalid={isInvalid}
                  isLoading={isLoading}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  value={field.state.value}
                />
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="email">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <RegisterFieldInput
                  autoComplete="email"
                  errors={field.state.meta.errors}
                  id="email"
                  isInvalid={isInvalid}
                  isLoading={isLoading}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  type="email"
                  value={field.state.value}
                />
              </Field>
            );
          }}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="password">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <RegisterFieldInput
                    autoComplete="new-password"
                    errors={field.state.meta.errors}
                    id="password"
                    isInvalid={isInvalid}
                    isLoading={isLoading}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    type="password"
                    value={field.state.value}
                  />
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                  <RegisterFieldInput
                    autoComplete="new-password"
                    errors={field.state.meta.errors}
                    id="confirmPassword"
                    isInvalid={isInvalid}
                    isLoading={isLoading}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    type="password"
                    value={field.state.value}
                  />
                </Field>
              );
            }}
          </form.Field>
        </div>

        <Field>
          <Button
            aria-busy={isLoading}
            aria-disabled={isLoading}
            className="aria-busy:pointer-events-none aria-busy:opacity-50"
            type="submit"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {isLoading ? "Creating account…" : "Create account"}
          </Button>
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Link className="text-foreground underline underline-offset-4" href="/login">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default RegisterForm;
