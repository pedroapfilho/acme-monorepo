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
import { Suspense, use, useRef, useState, useTransition } from "react";

import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/lib/form-schemas";
import { safeRedirectPath } from "@/lib/redirect-validation";

type Props = {
  searchParams: Promise<{ from?: string; message?: string }>;
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
  placeholder?: string;
  type: string;
  value: string;
};

const SignUpLinkFallback = () => (
  <Link className="text-foreground underline underline-offset-4" href="/register">
    Sign up
  </Link>
);

const SignUpLink = ({ searchParams }: Props) => {
  const { from } = use(searchParams);
  const safeTo = safeRedirectPath(from);

  return (
    <Link
      className="text-foreground underline underline-offset-4"
      href={safeTo === "/dashboard" ? "/register" : `/register?from=${encodeURIComponent(safeTo)}`}
    >
      Sign up
    </Link>
  );
};

const LoginFieldInput = ({
  autoComplete,
  errors,
  id,
  isInvalid,
  isPending,
  name,
  onBlur,
  onChange,
  placeholder,
  type,
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
        onChange={(e) => {
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        required
        type={type}
        value={value}
      />
      {isInvalid && <FieldError errors={errors} />}
    </>
  );
};

const LoginForm = ({ searchParams }: Props) => {
  const { push, refresh } = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [showUnverifiedNotice, setShowUnverifiedNotice] = useState(false);
  const isSubmitLatched = useRef(false);

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: ({ value }) => {
      setFormError(null);
      setShowUnverifiedNotice(false);
      startTransition(async () => {
        try {
          const { from } = await searchParams;
          const result = await authClient.signIn.email({
            email: value.email,
            password: value.password,
          });
          if (result.error) {
            if (result.error.code === "EMAIL_NOT_VERIFIED") {
              setShowUnverifiedNotice(true);
              return;
            }
            const message = result.error.message ?? "Invalid credentials";
            setFormError(message);
            toast.error(message);
            return;
          }
          push(safeRedirectPath(from));
          refresh();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "An error occurred. Please try again.";
          setFormError(message);
          toast.error(message);
        } finally {
          isSubmitLatched.current = false;
        }
      });
    },
    validators: { onSubmit: loginSchema },
  });

  const handleSubmit = async () => {
    if (isPending || isSubmitLatched.current) {
      return;
    }
    isSubmitLatched.current = true;
    try {
      await form.handleSubmit();
    } finally {
      if (!form.state.isValid) {
        isSubmitLatched.current = false;
      }
    }
  };

  return (
    // oxlint-disable-next-line react-doctor/no-prevent-default -- TanStack Form + Better Auth client drives submit; JS-off progressive enhancement is N/A
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void handleSubmit();
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
                <LoginFieldInput
                  autoComplete="email"
                  errors={field.state.meta.errors}
                  id="email"
                  isInvalid={isInvalid}
                  isPending={isPending}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  placeholder="m@example.com"
                  type="email"
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
                <LoginFieldInput
                  autoComplete="current-password"
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

        {showUnverifiedNotice && (
          <output aria-live="polite" className="block text-center text-sm">
            This email isn&apos;t verified yet. We just sent you a new link.
          </output>
        )}

        <Field>
          <Button aria-busy={isPending} aria-disabled={isPending} type="submit">
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Signing in…" : "Sign in"}
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Suspense fallback={<SignUpLinkFallback />}>
              <SignUpLink searchParams={searchParams} />
            </Suspense>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default LoginForm;
