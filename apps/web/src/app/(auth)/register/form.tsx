"use client";

import { useAuthForm } from "@repo/auth/form";
import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { registerSchema } from "@/lib/form-schemas";

const RegisterForm = () => {
  const { push, refresh } = useRouter();
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
      push("/dashboard");
      refresh();
    },
    schema: registerSchema,
  });

  if (pendingVerificationEmail) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-semibold">Check your email</p>
        <p className="text-sm text-muted-foreground">
          If <span className="font-medium text-foreground">{pendingVerificationEmail}</span> is new
          to acme, we&apos;ve sent a verification link. Click it to activate your account.
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
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="name">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  disabled={isLoading}
                  id="name"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="John Doe"
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                <Input
                  aria-invalid={isInvalid}
                  disabled={isLoading}
                  id="email"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="m@example.com"
                  type="email"
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                  <Input
                    aria-invalid={isInvalid}
                    disabled={isLoading}
                    id="password"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="password"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                  <Input
                    aria-invalid={isInvalid}
                    disabled={isLoading}
                    id="confirmPassword"
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="password"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </div>

        {rootError && <p className="text-sm text-destructive">{rootError}</p>}

        <Field>
          <Button disabled={isLoading} type="submit">
            {isLoading ? "Creating account..." : "Create account"}
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
