"use client";

import { buttonVariants } from "@repo/ui/components/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Field, FieldDescription } from "@repo/ui/components/field";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";

import { AuthForm, SubmitButton, useAuthForm } from "@/components/auth-form";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema } from "@/lib/form-schemas";

type Props = {
  searchParams: Promise<{ error?: string; token?: string }>;
};

const InvalidResetLink = () => (
  <>
    <CardHeader className="text-center">
      <CardTitle className="text-xl">
        <h2>Reset link invalid</h2>
      </CardTitle>
      <CardDescription>This password reset link is invalid or has expired.</CardDescription>
    </CardHeader>
    <CardContent>
      <Link className={cn(buttonVariants(), "w-full")} href="/recover">
        Request a new link
      </Link>
    </CardContent>
  </>
);

const NewPasswordForm = ({ token }: { token: string }) => {
  const { push } = useRouter();
  const { errorCode, form, submission } = useAuthForm({
    call: (value) => authClient.resetPassword({ newPassword: value.password, token }),
    defaultValues: { confirmPassword: "", password: "" },
    fallbackError: "Failed to reset password",
    handledErrorCodes: ["INVALID_TOKEN"],
    onSuccess: () => {
      push("/login?message=password-reset-success");
    },
    schema: resetPasswordSchema,
  });

  if (errorCode === "INVALID_TOKEN") {
    return <InvalidResetLink />;
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          <h2>Reset your password</h2>
        </CardTitle>
        <CardDescription>Enter a new password for your account</CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm submission={submission}>
          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="password">
              {(field) => <field.TextField autoComplete="new-password" label="New password" />}
            </form.AppField>
            <form.AppField name="confirmPassword">
              {(field) => <field.TextField autoComplete="new-password" label="Confirm password" />}
            </form.AppField>
          </div>

          <Field>
            <SubmitButton pendingLabel="Resetting…">Reset password</SubmitButton>
            <FieldDescription className="text-center">
              Back to{" "}
              <Link className="text-foreground underline underline-offset-4" href="/login">
                sign in
              </Link>
            </FieldDescription>
          </Field>
        </AuthForm>
      </CardContent>
    </>
  );
};

const ResetPasswordForm = ({ searchParams }: Props) => {
  const { error, token } = use(searchParams);

  if (error === "INVALID_TOKEN" || token === undefined || token === "") {
    return <InvalidResetLink />;
  }

  return <NewPasswordForm token={token} />;
};

export default ResetPasswordForm;
