"use client";

import { useAuthForm } from "@repo/auth/form";
import { AuthForm, AuthFormField, AuthFormRootError, AuthFormSubmit } from "@repo/auth/form-fields";
import { Field, FieldDescription, FieldGroup } from "@repo/ui/components/field";
import Link from "next/link";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { recoverSchema } from "@/lib/form-schemas";

const RecoverForm = () => {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const { form, isLoading, rootError } = useAuthForm({
    defaultValues: { email: "" },
    onSubmit: async (values) => {
      const result = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (result.error) {
        throw new Error(result.error.message ?? "Failed to send password reset email");
      }
      setSubmittedEmail(values.email);
    },
    schema: recoverSchema,
  });

  if (submittedEmail) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-semibold">Check your email</p>
        <p className="text-sm text-muted-foreground">
          If <span className="font-medium text-foreground">{submittedEmail}</span> matches an
          account, we&apos;ve sent a link to reset your password.
        </p>
        <p className="text-sm text-muted-foreground">
          Back to{" "}
          <Link className="text-foreground underline underline-offset-4" href="/login">
            sign in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <AuthForm form={form}>
      <FieldGroup>
        <AuthFormField
          disabled={isLoading}
          form={form}
          label="Email"
          name="email"
          placeholder="m@example.com"
          type="email"
        />

        <AuthFormRootError message={rootError} />

        <Field>
          <AuthFormSubmit isLoading={isLoading} label="Send reset link" loadingLabel="Sending..." />
          <FieldDescription className="text-center">
            Remembered your password?{" "}
            <Link className="text-foreground underline underline-offset-4" href="/login">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </AuthForm>
  );
};

export default RecoverForm;
