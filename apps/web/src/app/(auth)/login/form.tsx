"use client";

import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
} from "@repo/ui";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/lib/form-schemas";

type FormValues = z.infer<typeof loginSchema>;

const defaultValues: FormValues = {
  email: "",
  password: "",
};

type Props = {
  from: string;
};

const LoginForm = ({ from }: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        setIsLoading(true);
        setRootError(null);

        const result = await authClient.signIn.email({
          email: value.email,
          password: value.password,
        });

        if (result.error) {
          setRootError(result.error.message || "Invalid credentials");
          return;
        }

        router.push(from);
        router.refresh();
      } catch {
        setRootError("An error occurred during login. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    validators: {
      onSubmit: loginSchema,
    },
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
      <FieldGroup>
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

        <form.Field name="password">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                    href="/recover"
                  >
                    Forgot your password?
                  </Link>
                </div>
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

        {rootError && <p className="text-sm text-destructive">{rootError}</p>}

        <Field>
          <Button disabled={isLoading} type="submit">
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account? <Link href="/register">Sign up</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default LoginForm;
