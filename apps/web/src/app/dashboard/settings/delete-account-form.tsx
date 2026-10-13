"use client";

import { Field } from "@repo/ui/components/field";
import { useRouter } from "next/navigation";

import { AuthForm, SubmitButton, useAuthForm } from "@/components/auth-form";
import { authClient } from "@/lib/auth-client";
import { deleteAccountSchema } from "@/lib/form-schemas";

const DeleteAccountForm = () => {
  const { push, refresh } = useRouter();
  const { form, submission } = useAuthForm({
    call: (value) => authClient.deleteUser({ password: value.password }),
    defaultValues: { password: "" },
    fallbackError: "Failed to delete account",
    onSuccess: () => {
      push("/");
      refresh();
    },
    schema: deleteAccountSchema,
  });

  return (
    <AuthForm submission={submission}>
      <form.AppField name="password">
        {(field) => (
          <field.TextField
            autoComplete="current-password"
            id="deletePassword"
            label="Confirm with your password"
          />
        )}
      </form.AppField>

      <Field orientation="horizontal">
        <SubmitButton className="w-fit" pendingLabel="Deleting…" variant="destructive">
          Delete account
        </SubmitButton>
      </Field>
    </AuthForm>
  );
};

export { DeleteAccountForm };
