"use client";

import { Field, FieldDescription } from "@repo/ui/components/field";
import { AppForm, SubmitButton } from "@repo/ui/compositions/app-form";
import Link from "next/link";
import { useState } from "react";

import { useAuthForm } from "@/hooks/use-auth-form";
import { authClient } from "@/lib/auth-client";
import { recoverSchema } from "@/lib/form-schemas";
import { routes } from "@/lib/routes";

const RecoverForm = () => {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const { form, submission } = useAuthForm({
    call: (value) =>
      authClient.requestPasswordReset({
        email: value.email,
        redirectTo: `${window.location.origin}${routes.resetPassword.path}`,
      }),
    defaultValues: { email: "" },
    fallbackError: "Failed to send password reset email",
    onSuccess: (_data, value) => {
      setSubmittedEmail(value.email);
    },
    schema: recoverSchema,
  });

  if (submittedEmail !== null) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-semibold">Check your email</p>
        <p className="text-sm text-muted-foreground">
          If <span className="font-medium text-foreground">{submittedEmail}</span> matches an
          account, we&apos;ve sent a link to reset your password.
        </p>
        <p className="text-sm text-muted-foreground">
          Back to{" "}
          <Link className="text-foreground underline underline-offset-4" href={routes.login.path}>
            sign in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <AppForm submission={submission}>
      <form.AppField name="email">
        {(field) => (
          <field.TextField
            autoComplete="email"
            label="Email"
            placeholder="you@example.com"
            type="email"
          />
        )}
      </form.AppField>

      <Field>
        <SubmitButton pendingLabel="Sending…">Send reset link</SubmitButton>
        <FieldDescription className="text-center">
          Remembered your password?{" "}
          <Link className="text-foreground underline underline-offset-4" href={routes.login.path}>
            Sign in
          </Link>
        </FieldDescription>
      </Field>
    </AppForm>
  );
};

export default RecoverForm;
