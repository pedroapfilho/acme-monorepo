"use client";

import { newPassword } from "@repo/auth/policy";
import { Field } from "@repo/ui/components/field";
import { AppForm, SubmitButton } from "@repo/ui/compositions/app-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuthForm } from "@/hooks/use-auth-form";
import { authClient } from "@/lib/auth-client";
import { changePasswordSchema } from "@/lib/form-schemas";

const PasswordForm = () => {
  const { refresh } = useRouter();

  const { form, submission } = useAuthForm({
    call: (value) =>
      authClient.changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        revokeOtherSessions: true,
      }),
    defaultValues: { confirmPassword: "", currentPassword: "", newPassword: "" },
    fallbackError: "Failed to change password",
    onSuccess: () => {
      form.reset();
      toast.success("Password updated. Other sessions have been signed out.");
      refresh();
    },
    schema: changePasswordSchema,
  });

  return (
    <AppForm submission={submission}>
      <form.AppField name="currentPassword">
        {(field) => (
          <field.TextField
            autoComplete="current-password"
            label="Current password"
            type="password"
          />
        )}
      </form.AppField>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.AppField name="newPassword">
          {(field) => (
            <field.TextField
              autoComplete="new-password"
              description={newPassword.description}
              label="New password"
              type="password"
            />
          )}
        </form.AppField>
        <form.AppField name="confirmPassword">
          {(field) => (
            <field.TextField
              autoComplete="new-password"
              label="Confirm new password"
              type="password"
            />
          )}
        </form.AppField>
      </div>

      <Field orientation="horizontal">
        <SubmitButton className="w-fit" pendingLabel="Updating…">
          Update password
        </SubmitButton>
      </Field>
    </AppForm>
  );
};

export default PasswordForm;
