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
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/lib/form-schemas";

type Props = {
  from: string;
};

type FieldInputProps = {
  errors: Array<unknown>;
  isInvalid: boolean;
  isLoading: boolean;
  name: string;
  onBlur: () => void;
  onChange: (v: string) => void;
  value: string;
};

// These are proper React components so they can call useFieldContext inside <Field>.
const EmailFieldInput = ({
  errors,
  isInvalid,
  isLoading,
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

const PasswordFieldInput = ({
  errors,
  isInvalid,
  isLoading,
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
        disabled={isLoading}
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
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setFormError(null);
      try {
        const result = await authClient.signIn.email({
          email: value.email,
          password: value.password,
        });
        if (result.error) {
          throw new Error(result.error.message ?? "Invalid credentials");
        }
        push(from);
        refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An error occurred. Please try again.";
        setFormError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    validators: { onSubmit: loginSchema },
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
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link className="text-foreground underline underline-offset-4" href="/register">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default LoginForm;
