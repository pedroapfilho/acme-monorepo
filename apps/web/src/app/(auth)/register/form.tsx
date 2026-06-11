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
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { stashCredentials } from "@/app/(auth)/verify-email/credentials-store";
import { authClient } from "@/lib/auth-client";
import { registerSchema } from "@/lib/form-schemas";

type FieldInputProps = {
  autoComplete: string;
  errors: Array<unknown>;
  id: string;
  isInvalid: boolean;
  isPending: boolean;
  name: string;
  onBlur: () => void;
  onChange: (v: string) => void;
  type?: string;
  value: string;
};

const RegisterFieldInput = ({
  autoComplete,
  errors,
  id,
  isInvalid,
  isPending,
  name,
  onBlur,
  onChange,
  type = "text",
  value,
}: FieldInputProps) => {
  const { id: fieldId } = useFieldContext();
  return (
    <>
      <Input
        aria-describedby={isInvalid ? `${fieldId}-error` : undefined}
        aria-invalid={isInvalid}
        autoComplete={autoComplete}
        disabled={isPending}
        id={id}
        name={name}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        required
        type={type}
        value={value}
      />
      {isInvalid && <FieldError errors={errors} />}
    </>
  );
};

const RegisterForm = () => {
  const { push, refresh } = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { confirmPassword: "", email: "", name: "", password: "" },
    onSubmit: ({ value }) => {
      setFormError(null);
      startTransition(async () => {
        try {
          if (value.password !== value.confirmPassword) {
            throw new Error("Passwords do not match");
          }
          const result = await authClient.signUp.email({
            // Better Auth builds the verification URL from `body.callbackURL`;
            // emailVerification.callbackURL config is ignored by the sign-up route.
            callbackURL: "/verify-email/success",
            email: value.email,
            name: value.name,
            password: value.password,
          });
          if (result.error) {
            throw new Error(result.error.message ?? "Failed to register");
          }
          // No token means requireEmailVerification suppressed auto-sign-in (or enumeration prevention
          // returned synthetic success); both paths route to /verify-email with the same "check inbox" UX.
          if (!result.data?.token) {
            const handoff = stashCredentials({ email: value.email, password: value.password });
            push(`/verify-email?k=${handoff}`);
            return;
          }
          push("/dashboard");
          refresh();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "An error occurred. Please try again.";
          setFormError(message);
          toast.error(message);
        }
      });
    },
    validators: { onSubmit: registerSchema },
  });

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
        <form.Field name="name">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <RegisterFieldInput
                  autoComplete="name"
                  errors={field.state.meta.errors}
                  id="name"
                  isInvalid={isInvalid}
                  isPending={isPending}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  value={field.state.value}
                />
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="email">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <RegisterFieldInput
                  autoComplete="email"
                  errors={field.state.meta.errors}
                  id="email"
                  isInvalid={isInvalid}
                  isPending={isPending}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  type="email"
                  value={field.state.value}
                />
              </Field>
            );
          }}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="password">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <RegisterFieldInput
                    autoComplete="new-password"
                    errors={field.state.meta.errors}
                    id="password"
                    isInvalid={isInvalid}
                    isPending={isPending}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    type="password"
                    value={field.state.value}
                  />
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                  <RegisterFieldInput
                    autoComplete="new-password"
                    errors={field.state.meta.errors}
                    id="confirmPassword"
                    isInvalid={isInvalid}
                    isPending={isPending}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    type="password"
                    value={field.state.value}
                  />
                </Field>
              );
            }}
          </form.Field>
        </div>

        <Field>
          <Button
            aria-busy={isPending}
            aria-disabled={isPending}
            className="aria-busy:pointer-events-none aria-busy:opacity-50"
            type="submit"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Creating account…" : "Create account"}
          </Button>
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Link className="text-foreground underline underline-offset-4" href="/login">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default RegisterForm;
