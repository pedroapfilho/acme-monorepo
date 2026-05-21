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
import { resetPasswordSchema } from "@/lib/form-schemas";

type Props = {
  token: string | null;
};

type PasswordFieldInputProps = {
  autoComplete: string;
  errors: Array<unknown>;
  id: string;
  isInvalid: boolean;
  isLoading: boolean;
  name: string;
  onBlur: () => void;
  onChange: (v: string) => void;
  value: string;
};

const PasswordFieldInput = ({
  autoComplete,
  errors,
  id,
  isInvalid,
  isLoading,
  name,
  onBlur,
  onChange,
  value,
}: PasswordFieldInputProps) => {
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
        type="password"
        value={value}
      />
      {isInvalid && <FieldError errors={errors} />}
    </>
  );
};

const ResetPasswordForm = ({ token }: Props) => {
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { confirmPassword: "", password: "" },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setFormError(null);
      try {
        if (!token) {
          throw new Error("Invalid reset token. Please request a new password reset.");
        }
        if (value.password !== value.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const result = await authClient.resetPassword({
          newPassword: value.password,
          token,
        });
        if (result.error) {
          throw new Error(result.error.message ?? "Failed to reset password");
        }
        push("/login?message=password-reset-success");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An error occurred. Please try again.";
        setFormError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    validators: { onSubmit: resetPasswordSchema },
  });

  return (
    <form
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
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="password">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor="password">New password</FieldLabel>
                  <PasswordFieldInput
                    autoComplete="new-password"
                    errors={field.state.meta.errors}
                    id="password"
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

          <form.Field name="confirmPassword">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                  <PasswordFieldInput
                    autoComplete="new-password"
                    errors={field.state.meta.errors}
                    id="confirmPassword"
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
        </div>

        <Field>
          <Button
            aria-busy={isLoading}
            aria-disabled={isLoading}
            className="aria-busy:pointer-events-none aria-busy:opacity-50"
            type="submit"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {isLoading ? "Resetting…" : "Reset password"}
          </Button>
          <FieldDescription className="text-center">
            Back to{" "}
            <Link className="text-foreground underline underline-offset-4" href="/login">
              sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default ResetPasswordForm;
