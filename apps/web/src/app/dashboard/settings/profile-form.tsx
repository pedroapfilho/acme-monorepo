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
import { profileSchema } from "@/lib/form-schemas";
import { useAuthSubmit } from "@/lib/use-auth-submit";

type Props = {
  initialName: string;
};

const ProfileForm = ({ initialName }: Props) => {
  const { refresh } = useRouter();
  const { isPending, run, submit } = useAuthSubmit();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { name: initialName },
    onSubmit: ({ value }) => {
      setFormError(null);
      run(async () => {
        try {
          const result = await authClient.updateUser({ name: value.name });
          if (result.error) {
            const message = result.error.message ?? "Failed to update profile";
            setFormError(message);
            toast.error(message);
            return;
          }
          toast.success("Profile updated");
          refresh();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "An error occurred. Please try again.";
          setFormError(message);
          toast.error(message);
        }
      });
    },
    validators: { onSubmit: profileSchema },
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
        <form.Field name="name">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  autoComplete="name"
                  disabled={isPending}
                  id="name"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                  required
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <Field>
          <Button aria-busy={isPending} aria-disabled={isPending} className="w-fit" type="submit">
            {isPending && <Loader2 className="size-4 motion-safe:animate-spin" />}
            {isPending ? "Saving…" : "Save"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};

export { ProfileForm };
