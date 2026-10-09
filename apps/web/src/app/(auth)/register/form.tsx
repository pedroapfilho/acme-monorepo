"use client";

import { Field, FieldDescription } from "@repo/ui/components/field";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, use, useState } from "react";

import { AuthForm, SubmitButton, useAuthForm } from "@/components/auth-form";
import { authClient } from "@/lib/auth-client";
import { registerSchema } from "@/lib/form-schemas";
import { authPageHref, safeRedirectPath } from "@/lib/redirect-validation";

type Props = {
  searchParams: Promise<{ from?: string }>;
};

const SignInLinkFallback = () => (
  <Link className="text-foreground underline underline-offset-4" href="/login">
    Sign in
  </Link>
);

const SignInLink = ({ searchParams }: Props) => {
  const { from } = use(searchParams);

  return (
    <Link
      className="text-foreground underline underline-offset-4"
      href={authPageHref("/login", from)}
    >
      Sign in
    </Link>
  );
};

const RegisterForm = ({ searchParams }: Props) => {
  const { push, refresh } = useRouter();
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);
  const { form, submission } = useAuthForm({
    call: async (value) => {
      const { from } = await searchParams;
      return authClient.signUp.email({
        callbackURL: safeRedirectPath(from),
        email: value.email,
        name: value.name,
        password: value.password,
      });
    },
    defaultValues: { confirmPassword: "", email: "", name: "", password: "" },
    fallbackError: "Failed to register",
    onSuccess: async (data, value) => {
      if (data.token === null || data.token === "") {
        setSentToEmail(value.email);
        return;
      }
      const { from } = await searchParams;
      push(safeRedirectPath(from));
      refresh();
    },
    schema: registerSchema,
  });

  if (sentToEmail !== null) {
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
    <AuthForm submission={submission}>
      <form.AppField name="name">
        {(field) => <field.TextField autoComplete="name" label="Full Name" />}
      </form.AppField>

      <form.AppField name="email">
        {(field) => <field.TextField autoComplete="email" label="Email" />}
      </form.AppField>

      <div className="grid grid-cols-2 gap-4">
        <form.AppField name="password">
          {(field) => <field.TextField autoComplete="new-password" label="Password" />}
        </form.AppField>
        <form.AppField name="confirmPassword">
          {(field) => <field.TextField autoComplete="new-password" label="Confirm Password" />}
        </form.AppField>
      </div>

      <Field>
        <SubmitButton pendingLabel="Creating account…">Create account</SubmitButton>
        <FieldDescription className="text-center">
          Already have an account?{" "}
          <Suspense fallback={<SignInLinkFallback />}>
            <SignInLink searchParams={searchParams} />
          </Suspense>
        </FieldDescription>
      </Field>
    </AuthForm>
  );
};

export default RegisterForm;
