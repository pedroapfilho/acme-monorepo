"use client";

import { useAuthForm } from "@repo/auth/form";
import { AuthForm, AuthFormField, AuthFormRootError, AuthFormSubmit } from "@repo/auth/form-fields";
import { Field, FieldDescription, FieldGroup } from "@repo/ui/components/field";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { registerSchema } from "@/lib/form-schemas";

const RegisterForm = () => {
  const router = useRouter();
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  const { form, isLoading, rootError } = useAuthForm({
    defaultValues: { confirmPassword: "", email: "", name: "", password: "" },
    onSubmit: async (values) => {
      if (values.password !== values.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      const result = await authClient.signUp.email({
        email: values.email,
        name: values.name,
        password: values.password,
      });
      if (result.error) {
        throw new Error(result.error.message ?? "Failed to register");
      }
      // requireEmailVerification gates auto-sign-in: when active, Better Auth
      // returns the user but no session token. The dashboard middleware would
      // bounce the user back to /login (looking like silent failure), so show
      // a verification UI instead. The wording stays ambiguous so it's also
      // correct for the enumeration-prevention path (existing email →
      // synthetic-success). The real account holder gets a separate
      // notification email via emailAndPassword.onExistingUserSignUp.
      if (!result.data?.token) {
        setPendingVerificationEmail(values.email);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    },
    schema: registerSchema,
  });

  if (pendingVerificationEmail) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-semibold">Check your email</p>
        <p className="text-sm text-muted-foreground">
          If <span className="font-medium text-foreground">{pendingVerificationEmail}</span> is new
          to acme, we&apos;ve sent a verification link — click it to activate your account.
        </p>
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link className="text-foreground underline underline-offset-4" href="/login">
            Sign in
          </Link>{" "}
          or{" "}
          <Link className="text-foreground underline underline-offset-4" href="/recover">
            reset your password
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <AuthForm form={form}>
      <FieldGroup>
        <AuthFormField
          disabled={isLoading}
          form={form}
          label="Full Name"
          name="name"
          placeholder="John Doe"
        />

        <AuthFormField
          disabled={isLoading}
          form={form}
          label="Email"
          name="email"
          placeholder="m@example.com"
          type="email"
        />

        <div className="grid grid-cols-2 gap-4">
          <AuthFormField
            disabled={isLoading}
            form={form}
            label="Password"
            name="password"
            type="password"
          />

          <AuthFormField
            disabled={isLoading}
            form={form}
            label="Confirm Password"
            name="confirmPassword"
            type="password"
          />
        </div>

        <AuthFormRootError message={rootError} />

        <Field>
          <AuthFormSubmit
            isLoading={isLoading}
            label="Create account"
            loadingLabel="Creating account..."
          />
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Link className="text-foreground underline underline-offset-4" href="/login">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </AuthForm>
  );
};

export default RegisterForm;
