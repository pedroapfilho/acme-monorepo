"use client";

import { Button, Field, FieldError, FieldLabel, Input } from "@repo/ui";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  confirmPassword: z.string().min(12, "Password must be at least 12 characters"),
  password: z.string().min(12, "Password must be at least 12 characters"),
});

type FormValues = z.infer<typeof formSchema>;

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
        setIsLoading(true);
        setRootError(null);

        if (value.password !== value.confirmPassword) {
          setRootError("Passwords do not match");
          return;
        }

        if (!token) {
          setRootError("Invalid reset token. Please request a new password reset.");
          return;
        }

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
      onBlur: formSchema,
      onChange: formSchema,
    },
  });

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field name="password">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid || undefined}>
              <FieldLabel htmlFor="password">New Password</FieldLabel>
              <Input
                aria-invalid={isInvalid}
                disabled={isLoading}
                id="password"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter your new password"
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
              <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
              <Input
                aria-invalid={isInvalid}
                disabled={isLoading}
                id="confirmPassword"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Confirm your new password"
                type="password"
                value={field.state.value}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      {rootError && <div className="text-sm text-red-500">{rootError}</div>}

      <Button className="w-full" disabled={isLoading} type="submit">
        {isLoading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
