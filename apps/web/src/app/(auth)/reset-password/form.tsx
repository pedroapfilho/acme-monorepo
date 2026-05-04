"use client";

import { useAuthForm } from "@repo/auth/form";
import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema } from "@/lib/form-schemas";

type Props = {
  token: string | null;
};

const ResetPasswordForm = ({ token }: Props) => {
  const router = useRouter();
  const { form, isLoading, rootError } = useAuthForm({
    defaultValues: { confirmPassword: "", password: "" },
    onSubmit: async (values) => {
      if (!token) {
        throw new Error("Invalid reset token. Please request a new password reset.");
      }
      if (values.password !== values.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      const result = await authClient.resetPassword({
        newPassword: values.password,
        token,
      });
      if (result.error) {
        throw new Error(result.error.message ?? "Failed to reset password");
      }
      router.push("/login?message=password-reset-success");
    },
    schema: resetPasswordSchema,
  });

  return (
    <form
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
