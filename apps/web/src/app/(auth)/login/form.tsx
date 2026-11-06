"use client";

import { Field, FieldDescription } from "@repo/ui/components/field";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthPageLink } from "@/app/(auth)/auth-page-link";
import { AuthForm, SubmitButton, useAuthForm } from "@/components/auth-form";
import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/lib/form-schemas";
import { safeRedirectPath } from "@/lib/redirect-validation";

type Props = {
  searchParams: Promise<{ from?: string; message?: string }>;
};

const LoginForm = ({ searchParams }: Props) => {
  const { push, refresh } = useRouter();

  const { errorCode, form, submission } = useAuthForm({
    call: (value) => authClient.signIn.email(value),
    defaultValues: { email: "", password: "" },
    fallbackError: "Invalid credentials",
    handledErrorCodes: ["EMAIL_NOT_VERIFIED"],
    onSuccess: async () => {
      const { from } = await searchParams;
      push(safeRedirectPath(from));
      refresh();
    },
    schema: loginSchema,
  });

  return (
    <AuthForm submission={submission}>
      <form.AppField name="email">
        {(field) => (
          <field.TextField autoComplete="email" label="Email" placeholder="you@example.com" />
        )}
      </form.AppField>

      <form.AppField name="password">
        {(field) => (
          <field.TextField
            autoComplete="current-password"
            label="Password"
            labelAction={
              <Link
                className="ml-auto text-sm text-foreground underline underline-offset-4"
                href="/recover"
              >
                Forgot your password?
              </Link>
            }
          />
        )}
      </form.AppField>

      {errorCode === "EMAIL_NOT_VERIFIED" && (
        <output aria-live="polite" className="block text-center text-sm">
          This email isn&apos;t verified yet. We just sent you a new link.
        </output>
      )}

      <Field>
        <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
        <FieldDescription className="text-center">
          Don&apos;t have an account?{" "}
          <AuthPageLink page="/register" searchParams={searchParams}>
            Sign up
          </AuthPageLink>
        </FieldDescription>
      </Field>
    </AuthForm>
  );
};

export default LoginForm;
