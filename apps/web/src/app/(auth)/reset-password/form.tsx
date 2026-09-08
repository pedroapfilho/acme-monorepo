"use client";

import { Button } from "@repo/ui/components/button";
import { Field, FieldDescription, FieldGroup } from "@repo/ui/components/field";
import { toast } from "@repo/ui/components/sonner";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthPasswordField } from "@/components/auth-password-field";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema } from "@/lib/form-schemas";
import { useAuthSubmit } from "@/lib/use-auth-submit";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

const ResetPasswordForm = ({ searchParams }: Props) => {
  const { push } = useRouter();
  const { isPending, run, submit } = useAuthSubmit();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { confirmPassword: "", password: "" },
    onSubmit: ({ value }) => {
      setFormError(null);
      run(async () => {
        try {
          const { token = null } = await searchParams;
          if (token === null || token === "") {
            const message = "Invalid reset token. Please request a new password reset.";
            setFormError(message);
            toast.error(message);
            return;
          }
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
    // oxlint-disable-next-line react-doctor/no-prevent-default -- TanStack Form + Better Auth client drives submit; JS-off progressive enhancement is N/A
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
          <Button aria-busy={isPending} aria-disabled={isPending} type="submit">
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

export default ResetPasswordForm;
