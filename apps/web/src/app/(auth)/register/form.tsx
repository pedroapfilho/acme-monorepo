"use client";

import { name, newPassword } from "@repo/auth/policy";
import { Field, FieldDescription } from "@repo/ui/components/field";
import { AppForm, SubmitButton } from "@repo/ui/compositions/app-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthPageLink } from "@/app/(auth)/auth-page-link";
import { useAuthForm } from "@/hooks/use-auth-form";
import { authClient } from "@/lib/auth-client";
import { registerSchema } from "@/lib/form-schemas";
import { safeRedirectPath } from "@/lib/redirect-validation";
import { routes } from "@/lib/routes";

type Props = {
  searchParams: Promise<{ from?: string }>;
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
    <AppForm submission={submission}>
      <form.AppField name="name">
        {(field) => (
          <field.TextField autoComplete="name" description={name.description} label="Full Name" />
        )}
      </form.AppField>

      <form.AppField name="email">
        {(field) => <field.TextField autoComplete="email" label="Email" type="email" />}
      </form.AppField>

      <div className="grid grid-cols-2 gap-4">
        <form.AppField name="password">
          {(field) => (
            <field.TextField
              autoComplete="new-password"
              description={newPassword.description}
              label="Password"
              type="password"
            />
          )}
        </form.AppField>
        <form.AppField name="confirmPassword">
          {(field) => (
            <field.TextField autoComplete="new-password" label="Confirm Password" type="password" />
          )}
        </form.AppField>
      </div>

      <Field>
        <SubmitButton pendingLabel="Creating account…">Create account</SubmitButton>
        <FieldDescription className="text-center">
          Already have an account?{" "}
          <AuthPageLink page={routes.login.path} searchParams={searchParams}>
            Sign in
          </AuthPageLink>
        </FieldDescription>
      </Field>
    </AppForm>
  );
};

export default RegisterForm;
