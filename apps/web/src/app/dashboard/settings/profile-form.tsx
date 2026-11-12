"use client";

import { Field } from "@repo/ui/components/field";
import { AppForm, SubmitButton } from "@repo/ui/compositions/app-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuthForm } from "@/hooks/use-auth-form";
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
    <AppForm submission={submission}>
      <form.AppField name="name">
        {(field) => (
          <field.TextField
            autoComplete="name"
            description="3 to 32 characters."
            label="Full Name"
          />
        )}
      </form.AppField>

      <Field orientation="horizontal">
        <SubmitButton className="w-fit" pendingLabel="Saving…">
          Save
        </SubmitButton>
      </Field>
    </AppForm>
  );
};

export { ProfileForm };
