"use client";

import { Field } from "@repo/ui/components/field";
import { useState } from "react";

import { AuthForm, SubmitButton, useAuthForm } from "@/components/auth-form";
import { authClient } from "@/lib/auth-client";
import { changeEmailSchema } from "@/lib/form-schemas";

type Props = {
  currentEmail: string;
  emailVerified: boolean;
  enabled: boolean;
};

const EmailForm = ({ currentEmail, emailVerified, enabled }: Props) => {
  const [confirmationAddress, setConfirmationAddress] = useState<string | null>(null);
  const { form, submission } = useAuthForm({
    call: (value) =>
      authClient.changeEmail({ callbackURL: "/dashboard/settings", newEmail: value.email }),
    defaultValues: { email: "" },
    fallbackError: "Failed to change email",
    onSuccess: (_data, value) => {
      setConfirmationAddress(emailVerified ? currentEmail : value.email);
    },
    schema: changeEmailSchema,
  });

  if (!enabled) {
    return (
      <p className="text-sm text-muted-foreground">
        Email changes are unavailable until email delivery is configured.
      </p>
    );
  }

  if (confirmationAddress !== null) {
    return (
      <output aria-live="polite" className="block space-y-1">
        <span className="block font-medium">Confirm the change</span>
        <span className="block text-sm text-muted-foreground">
          We sent a confirmation link to <span className="font-medium">{confirmationAddress}</span>.
          Click it to continue the email change.
        </span>
      </output>
    );
  }

  return (
    <AuthForm submission={submission}>
      <form.AppField name="email">
        {(field) => (
          <field.TextField
            autoComplete="email"
            id="newEmail"
            label="New email"
            placeholder={currentEmail}
          />
        )}
      </form.AppField>

      <Field orientation="horizontal">
        <SubmitButton className="w-fit" pendingLabel="Updating…">
          Update email
        </SubmitButton>
      </Field>
    </AuthForm>
  );
};

export { EmailForm };
