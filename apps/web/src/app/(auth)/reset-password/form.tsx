"use client";

import { Button, buttonVariants } from "@repo/ui/components/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Field, FieldDescription, FieldGroup } from "@repo/ui/components/field";
import { cn } from "@repo/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";

import { AuthPasswordField } from "@/components/auth-password-field";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema } from "@/lib/form-schemas";
import { useAuthSubmit } from "@/lib/use-auth-submit";

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
  const { isPending, run, submit } = useAuthSubmit();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { confirmPassword: "", password: "" },
    onSubmit: ({ value }) => {
      setFormError(null);
      run(async () => {
        try {
          const result = await authClient.resetPassword({
            newPassword: value.password,
            token,
          });
          if (result.error) {
            const message = result.error.message ?? "Failed to reset password";
            setFormError(message);
            toast.error(message);
            return;
          }
          push("/login?message=password-reset-success");
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "An error occurred. Please try again.";
          setFormError(message);
          toast.error(message);
        }
      });
    },
    validators: { onSubmit: resetPasswordSchema },
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void submit(form);
      }}
    >
      <div aria-atomic="true" aria-live="polite" className="sr-only">
        {formError}
      </div>
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="password">
            {(field) => (
              <AuthPasswordField disabled={isPending} field={field} label="New password" />
            )}
          </form.Field>
          <form.Field name="confirmPassword">
            {(field) => (
              <AuthPasswordField disabled={isPending} field={field} label="Confirm password" />
            )}
          </form.Field>
        </div>

        <Field>
          <Button aria-busy={isPending} disabled={isPending} type="submit">
            {isPending && <Loader2 className="size-4 motion-safe:animate-spin" />}
            {isPending ? "Resetting…" : "Reset password"}
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

const ResetPasswordForm = ({ searchParams }: Props) => {
  const { error, token } = use(searchParams);

  if (error === "INVALID_TOKEN" || token === undefined || token === "") {
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
        <NewPasswordForm token={token} />
      </CardContent>
    </>
  );
};

export default ResetPasswordForm;
