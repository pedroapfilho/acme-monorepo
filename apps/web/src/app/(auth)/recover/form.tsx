"use client";

import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  useFieldContext,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { toast } from "@repo/ui/components/sonner";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { recoverSchema } from "@/lib/form-schemas";

type EmailFieldInputProps = {
  errors: Array<unknown>;
  isInvalid: boolean;
  isLoading: boolean;
  name: string;
  onBlur: () => void;
  onChange: (v: string) => void;
  value: string;
};

const EmailFieldInput = ({
  errors,
  isInvalid,
  isLoading,
  name,
  onBlur,
  onChange,
  value,
}: EmailFieldInputProps) => {
  const { id } = useFieldContext();
  return (
    <>
      <Input
        aria-describedby={isInvalid ? `${id}-error` : undefined}
        aria-invalid={isInvalid}
        autoComplete="email"
        disabled={isLoading}
        id="email"
        name={name}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        placeholder="m@example.com"
        required
        type="email"
        value={value}
      />
      {isInvalid && <FieldError errors={errors} />}
    </>
  );
};

const RecoverForm = () => {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setFormError(null);
      try {
        const result = await authClient.requestPasswordReset({
          email: value.email,
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (result.error) {
          throw new Error(result.error.message ?? "Failed to send password reset email");
        }
        setSubmittedEmail(value.email);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An error occurred. Please try again.";
        setFormError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    validators: { onSubmit: recoverSchema },
  });

  if (submittedEmail) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-semibold">Check your email</p>
        <p className="text-sm text-muted-foreground">
          If <span className="font-medium text-foreground">{submittedEmail}</span> matches an
          account, we&apos;ve sent a link to reset your password.
        </p>
        <p className="text-sm text-muted-foreground">
          Back to{" "}
          <Link className="text-foreground underline underline-offset-4" href="/login">
            sign in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
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
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <EmailFieldInput
                  errors={field.state.meta.errors}
                  isInvalid={isInvalid}
                  isLoading={isLoading}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  value={field.state.value}
                />
              </Field>
            );
          }}
        </form.Field>

        <Field>
          <Button
            aria-busy={isLoading}
            aria-disabled={isLoading}
            className="aria-busy:pointer-events-none aria-busy:opacity-50"
            type="submit"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {isLoading ? "Sending…" : "Send reset link"}
          </Button>
          <FieldDescription className="text-center">
            Remembered your password?{" "}
            <Link className="text-foreground underline underline-offset-4" href="/login">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default RecoverForm;
