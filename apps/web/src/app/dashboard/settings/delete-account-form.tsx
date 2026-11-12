"use client";

import { Field } from "@repo/ui/components/field";
import { AppForm, SubmitButton } from "@repo/ui/compositions/app-form";
import { useRouter } from "next/navigation";

import { useAuthForm } from "@/hooks/use-auth-form";
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
    <AppForm submission={submission}>
      <form.AppField name="password">
        {(field) => (
          <field.TextField
            autoComplete="current-password"
            id="deletePassword"
            label="Confirm with your password"
            type="password"
          />
        )}
      </form.AppField>

      <Field orientation="horizontal">
        <SubmitButton className="w-fit" pendingLabel="Deleting…" variant="destructive">
          Delete account
        </SubmitButton>
      </Field>
    </AppForm>
  );
};

export { DeleteAccountForm };
