"use client";

import { Button } from "@repo/ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { toast } from "@repo/ui/components/sonner";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { changeEmailSchema } from "@/lib/form-schemas";
import { useAuthSubmit } from "@/lib/use-auth-submit";

type Props = {
  currentEmail: string;
  emailVerified: boolean;
  enabled: boolean;
};

const EmailForm = ({ currentEmail, emailVerified, enabled }: Props) => {
  const { isPending, run, submit } = useAuthSubmit();
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationAddress, setConfirmationAddress] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: "" },
    onSubmit: ({ value }) => {
      setFormError(null);
      run(async () => {
        try {
          const result = await authClient.changeEmail({
            callbackURL: "/dashboard/settings",
            newEmail: value.email,
          });
          if (result.error) {
            const message = result.error.message ?? "Failed to change email";
            setFormError(message);
            toast.error(message);
            return;
          }
          setConfirmationAddress(emailVerified ? currentEmail : value.email);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "An error occurred. Please try again.";
          setFormError(message);
          toast.error(message);
        }
      });
    },
    validators: { onSubmit: changeEmailSchema },
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
        <form.Field name="email">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor="newEmail">New email</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  autoComplete="email"
                  disabled={isPending}
                  id="newEmail"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                  placeholder={currentEmail}
                  required
                  type="email"
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
            {isPending ? "Updating…" : "Update email"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};

export { EmailForm };
