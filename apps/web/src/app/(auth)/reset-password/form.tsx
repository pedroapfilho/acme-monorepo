"use client";

import { useAuthForm } from "@repo/auth/form";
import { AuthForm, AuthFormField, AuthFormRootError, AuthFormSubmit } from "@repo/auth/form-fields";
import { Field, FieldDescription, FieldGroup } from "@repo/ui/components/field";
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
    <AuthForm form={form}>
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <AuthFormField
            disabled={isLoading}
            form={form}
            label="New password"
            name="password"
            type="password"
          />

          <AuthFormField
            disabled={isLoading}
            form={form}
            label="Confirm password"
            name="confirmPassword"
            type="password"
          />
        </div>

        <AuthFormRootError message={rootError} />

        <Field>
          <AuthFormSubmit
            isLoading={isLoading}
            label="Reset password"
            loadingLabel="Resetting..."
          />
          <FieldDescription className="text-center">
            Back to{" "}
            <Link className="text-foreground underline underline-offset-4" href="/login">
              sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </AuthForm>
  );
};

export default ResetPasswordForm;
