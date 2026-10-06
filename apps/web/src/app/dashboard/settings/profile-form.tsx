"use client";

import { Field } from "@repo/ui/components/field";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AuthForm, SubmitButton, useAuthForm } from "@/components/auth-form";
import { authClient } from "@/lib/auth-client";
import { profileSchema } from "@/lib/form-schemas";

type Props = {
  initialName: string;
};

const ProfileForm = ({ initialName }: Props) => {
  const { refresh } = useRouter();
  const { form, submission } = useAuthForm({
    call: (value) => authClient.updateUser({ name: value.name }),
    defaultValues: { name: initialName },
    fallbackError: "Failed to update profile",
    onSuccess: () => {
      toast.success("Profile updated");
      refresh();
    },
    schema: profileSchema,
  });

  return (
    <AuthForm submission={submission}>
      <form.AppField name="name">
        {(field) => <field.TextField autoComplete="name" label="Full Name" />}
      </form.AppField>

      <Field orientation="horizontal">
        <SubmitButton className="w-fit" pendingLabel="Saving…">
          Save
        </SubmitButton>
      </Field>
    </AuthForm>
  );
};

export { ProfileForm };
