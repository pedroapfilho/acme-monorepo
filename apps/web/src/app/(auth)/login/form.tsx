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
import { loginSchema } from "@/lib/form-schemas";

type Props = {
  from: string;
};

type FieldInputProps = {
  errors: Array<unknown>;
  isInvalid: boolean;
  isPending: boolean;
  name: string;
  onBlur: () => void;
  onChange: (v: string) => void;
  value: string;
};

// These are proper React components so they can call useFieldContext inside <Field>.
const EmailFieldInput = ({
  errors,
  isInvalid,
  isPending,
  name,
  onBlur,
  onChange,
  value,
}: FieldInputProps) => {
  const { id } = useFieldContext();
  return (
    <>
      <Input
        aria-describedby={isInvalid ? `${id}-error` : undefined}
        aria-invalid={isInvalid}
        autoComplete="email"
        disabled={isPending}
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

const PasswordFieldInput = ({
  errors,
  isInvalid,
  isPending,
  name,
  onBlur,
  onChange,
  value,
}: FieldInputProps) => {
  const { id } = useFieldContext();
  return (
    <>
      <Input
        aria-describedby={isInvalid ? `${id}-error` : undefined}
        aria-invalid={isInvalid}
        autoComplete="current-password"
        disabled={isPending}
        id="password"
        name={name}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        required
        type="password"
        value={value}
      />
      {isInvalid && <FieldError errors={errors} />}
    </>
  );
};

const LoginForm = ({ from }: Props) => {
  const { push, refresh } = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [showUnverifiedNotice, setShowUnverifiedNotice] = useState(false);

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: ({ value }) => {
      setFormError(null);
      setShowUnverifiedNotice(false);
      startTransition(async () => {
        try {
          const result = await authClient.signIn.email({
            email: value.email,
            password: value.password,
          });
          if (result.error) {
            // Better Auth 403s unverified accounts and (sendOnSignIn) re-sends
            // the verification link — informational, not a credentials error.
            if (result.error.code === "EMAIL_NOT_VERIFIED") {
              setShowUnverifiedNotice(true);
              return;
            }
            throw new Error(result.error.message ?? "Invalid credentials");
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
    validators: { onSubmit: loginSchema },
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        // TanStack Form drives submit; progressive-enhancement N/A
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

        <form.Field name="password">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    className="ml-auto text-sm text-foreground underline underline-offset-4"
                    href="/recover"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <PasswordFieldInput
                  errors={field.state.meta.errors}
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

        {showUnverifiedNotice && (
          <output aria-live="polite" className="block text-center text-sm">
            This email isn&apos;t verified yet — we just sent you a new link.
          </output>
        )}

        <Field>
          <Button
            aria-busy={isPending}
            aria-disabled={isPending}
            className="aria-busy:pointer-events-none aria-busy:opacity-50"
            type="submit"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Signing in…" : "Sign in"}
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            {/* Carry the redirect context across the form switch so signup can
                bake it into the verification email's callbackURL. */}
            <Link
              className="text-foreground underline underline-offset-4"
              href={
                from === "/dashboard" ? "/register" : `/register?from=${encodeURIComponent(from)}`
              }
            >
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default LoginForm;
