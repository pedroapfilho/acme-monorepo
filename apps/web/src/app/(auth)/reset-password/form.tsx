"use client";

import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
} from "@repo/ui";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema } from "@/lib/form-schemas";

type FormValues = z.infer<typeof resetPasswordSchema>;

const defaultValues: FormValues = {
  confirmPassword: "",
  password: "",
};

type Props = {
  token: string | null;
};

const ResetPasswordForm = ({ token }: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        if (!token) {
          setRootError("Invalid reset token. Please request a new password reset.");
          return;
        }

        if (value.password !== value.confirmPassword) {
          setRootError("Passwords do not match");
          return;
        }

        setIsLoading(true);
        setRootError(null);

        const result = await authClient.resetPassword({
          newPassword: value.password,
          token,
        });

        if (result.error) {
          setRootError(result.error.message || "Failed to reset password");
          return;
        }

        router.push("/login?message=password-reset-success");
      } catch {
        setRootError("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    validators: {
      onSubmit: resetPasswordSchema,
    },
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="password">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor="password">New password</FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    disabled={isLoading}
                    id="password"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="password"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                  <Input
                    aria-invalid={isInvalid}
                    disabled={isLoading}
                    id="confirmPassword"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="password"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </div>

        {rootError && <p className="text-sm text-destructive">{rootError}</p>}

        <Field>
          <Button disabled={isLoading} type="submit">
            {isLoading ? "Resetting..." : "Reset password"}
          </Button>
          <FieldDescription className="text-center">
            Back to <Link href="/login">sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default ResetPasswordForm;
