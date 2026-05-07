"use client";

import { useAuthForm } from "@repo/auth/form";
import { AuthForm, AuthFormField, AuthFormRootError, AuthFormSubmit } from "@repo/auth/form-fields";
import { Field, FieldDescription, FieldGroup } from "@repo/ui/components/field";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/lib/form-schemas";

type Props = {
  from: string;
};

const LoginForm = ({ from }: Props) => {
  const router = useRouter();
  const { form, isLoading, rootError } = useAuthForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async (values) => {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });
      if (result.error) {
        throw new Error(result.error.message ?? "Invalid credentials");
      }
      router.push(from);
      router.refresh();
    },
    schema: loginSchema,
  });

  return (
    <AuthForm form={form}>
      <FieldGroup>
        <AuthFormField
          disabled={isLoading}
          form={form}
          label="Email"
          name="email"
          placeholder="m@example.com"
          type="email"
        />

        <AuthFormField
          disabled={isLoading}
          form={form}
          label="Password"
          labelSlot={
            <Link
              className="ml-auto text-sm text-foreground underline underline-offset-4"
              href="/recover"
            >
              Forgot your password?
            </Link>
          }
          name="password"
          type="password"
        />

        <AuthFormRootError message={rootError} />

        <Field>
          <AuthFormSubmit isLoading={isLoading} label="Sign in" loadingLabel="Signing in..." />
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link className="text-foreground underline underline-offset-4" href="/register">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </AuthForm>
  );
};

export default LoginForm;
