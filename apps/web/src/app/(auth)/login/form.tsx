"use client";

import { Button, Field, FieldError, FieldLabel, Input } from "@repo/ui";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { BoneyardSkeleton } from "@/components/boneyard-skeleton";
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
    <BoneyardSkeleton
      fixture={
        <div className="space-y-4">
          <div className="h-10 w-full rounded bg-neutral-200" />
          <div className="h-10 w-full rounded bg-neutral-200" />
          <div className="h-10 w-full rounded bg-neutral-200" />
        </div>
      }
      loading={isLoading}
      name="login-form"
    >
      <form
        className="space-y-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
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
                  placeholder="you@example.com"
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
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  disabled={isLoading}
                  id="password"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter your password"
                  type="password"
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        {rootError && <div className="text-sm text-red-500">{rootError}</div>}

        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading ? "Logging in..." : "Log In"}
        </Button>
      </form>
    </BoneyardSkeleton>
  );
};

export default LoginForm;
