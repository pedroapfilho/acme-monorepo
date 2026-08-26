"use client";

import { Button } from "@repo/ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { toast } from "@repo/ui/components/sonner";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { changePasswordSchema } from "@/lib/form-schemas";
import { useAuthSubmit } from "@/lib/use-auth-submit";

type PasswordDependencies = {
  changePassword: typeof authClient.changePassword;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  useAppRouter: typeof useRouter;
};

const createPasswordForm = ({
  changePassword,
  showError,
  showSuccess,
  useAppRouter,
}: PasswordDependencies) => {
  const PasswordForm = () => {
    const { refresh } = useAppRouter();
    const { isPending, run, submit } = useAuthSubmit();
    const [formError, setFormError] = useState<string | null>(null);

    const form = useForm({
      defaultValues: { confirmPassword: "", currentPassword: "", newPassword: "" },
      onSubmit: ({ value }) => {
        setFormError(null);
        run(async () => {
          try {
            const result = await changePassword({
              currentPassword: value.currentPassword,
              newPassword: value.newPassword,
              revokeOtherSessions: true,
            });
            if (result.error) {
              const message = result.error.message ?? "Failed to change password";
              setFormError(message);
              showError(message);
              return;
            }
            form.reset();
            showSuccess("Password updated. Other sessions have been signed out.");
            refresh();
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "An error occurred. Please try again.";
            setFormError(message);
            showError(message);
          }
        });
      },
      validators: { onSubmit: changePasswordSchema },
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
          <form.Field name="currentPassword">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    autoComplete="current-password"
                    disabled={isPending}
                    id="currentPassword"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    required
                    type="password"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="newPassword">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      autoComplete="new-password"
                      disabled={isPending}
                      id="newPassword"
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                      }}
                      required
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
                    <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      autoComplete="new-password"
                      disabled={isPending}
                      id="confirmPassword"
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                      }}
                      required
                      type="password"
                      value={field.state.value}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <Field>
            <Button aria-busy={isPending} aria-disabled={isPending} className="w-fit" type="submit">
              {isPending && <Loader2 className="size-4 motion-safe:animate-spin" />}
              {isPending ? "Updating…" : "Update password"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    );
  };

  return PasswordForm;
};

const PasswordForm = createPasswordForm({
  changePassword: authClient.changePassword,
  showError: (message) => {
    toast.error(message);
  },
  showSuccess: (message) => {
    toast.success(message);
  },
  useAppRouter: useRouter,
});

export { createPasswordForm };
export default PasswordForm;
