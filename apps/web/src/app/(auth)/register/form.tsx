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

import { authClient } from "@/lib/auth-client";
import { registerSchema } from "@/lib/form-schemas";

type Props = {
  from: string;
};

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

const RegisterForm = ({ from }: Props) => {
  const { push, refresh } = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { confirmPassword: "", email: "", name: "", password: "" },
    onSubmit: ({ value }) => {
      setFormError(null);
      startTransition(async () => {
        try {
          // Better Auth bakes callbackURL into the verification link, so the
          // email clicker lands back on the page that sent them to auth.
          const result = await authClient.signUp.email({
            callbackURL: from,
            email: value.email,
            name: value.name,
            password: value.password,
          });
          if (result.error) {
            // Inline instead of throw-to-catch: React Compiler can't memoize
            // components with a ThrowStatement inside try/catch yet.
            const message = result.error.message ?? "Failed to register";
            setFormError(message);
            toast.error(message);
            return;
          }
          // No token means requireEmailVerification suppressed auto-sign-in (or enumeration prevention
          // returned synthetic success); both paths show the same inline "check your email" state.
          // Clicking the emailed link verifies AND signs in the clicking device.
          if (!result.data?.token) {
            setSentToEmail(value.email);
            return;
          }
          push(from);
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

  if (sentToEmail) {
    return (
      <output aria-live="polite" className="block space-y-1 text-center">
        <span className="block font-medium">Check your email</span>
        <span className="block text-sm text-muted-foreground">
          We sent a verification link to <span className="font-medium">{sentToEmail}</span>. Click
          it to verify your account and sign in.
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
            {/* Carry the redirect context across the form switch so login can
                push it after sign-in. */}
            <Link
              className="text-foreground underline underline-offset-4"
              href={from === "/dashboard" ? "/login" : `/login?from=${encodeURIComponent(from)}`}
            >
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default RegisterForm;
