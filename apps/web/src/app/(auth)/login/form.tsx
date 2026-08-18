"use client";

import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { toast } from "@repo/ui/components/sonner";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, use, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/lib/form-schemas";
import { safeRedirectPath } from "@/lib/redirect-validation";
import { useAuthSubmit } from "@/lib/use-auth-submit";

type Props = {
  searchParams: Promise<{ from?: string; message?: string }>;
};

type LoginDependencies = {
  showError: (message: string) => void;
  signInEmail: typeof authClient.signIn.email;
  useAppRouter: typeof useRouter;
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

const createLoginForm = ({ showError, signInEmail, useAppRouter }: LoginDependencies) => {
  const LoginForm = ({ searchParams }: Props) => {
    const { push, refresh } = useAppRouter();
    const { isPending, run, submit } = useAuthSubmit();
    const [formError, setFormError] = useState<string | null>(null);
    const [showUnverifiedNotice, setShowUnverifiedNotice] = useState(false);

    const form = useForm({
      defaultValues: { email: "", password: "" },
      onSubmit: ({ value }) => {
        setFormError(null);
        setShowUnverifiedNotice(false);
        run(async () => {
          try {
            const { from } = await searchParams;
            const result = await signInEmail({
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
              showError(message);
              return;
            }
            push(safeRedirectPath(from));
            refresh();
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "An error occurred. Please try again.";
            setFormError(message);
            showError(message);
          }
        });
      },
      validators: { onSubmit: loginSchema },
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
          <form.Field name="email">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    autoComplete="email"
                    disabled={isPending}
                    id="email"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    placeholder="m@example.com"
                    required
                    type="email"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                  <Input
                    aria-invalid={isInvalid}
                    autoComplete="current-password"
                    disabled={isPending}
                    id="password"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    required
                    type="password"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
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

  return LoginForm;
};

const LoginForm = createLoginForm({
  showError: (message) => {
    toast.error(message);
  },
  signInEmail: authClient.signIn.email,
  useAppRouter: useRouter,
});

export { createLoginForm };
export default LoginForm;
