"use client";

import { Button, Field, FieldError, FieldLabel, Input } from "@repo/ui";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  email: z.string().email(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  email: "",
};

const RecoverForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        setIsLoading(true);
        setRootError(null);

        const result = await authClient.requestPasswordReset({
          email: value.email,
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (result.error) {
          setRootError(result.error.message || "Failed to send password reset email");
          return;
        }

        router.push("/login?message=password-reset-sent");
      } catch {
        setRootError("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    validators: {
      onBlur: formSchema,
      onChange: formSchema,
    },
  });

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field name="email">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid || undefined}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                aria-invalid={isInvalid}
                disabled={isLoading}
                id="email"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="email@address.com"
                type="email"
                value={field.state.value}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      {rootError && <div className="text-sm text-red-500">{rootError}</div>}

      <Button className="w-full" disabled={isLoading} type="submit">
        {isLoading ? "Sending..." : "Submit Request"}
      </Button>
    </form>
  );
};

export default RecoverForm;
