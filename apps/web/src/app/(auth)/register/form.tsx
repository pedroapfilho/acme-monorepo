"use client";

import { Button, Field, FieldError, FieldLabel, Input } from "@repo/ui";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { BoneyardSkeleton } from "@/components/boneyard-skeleton";
import { authClient } from "@/lib/auth-client";
import { registerSchema } from "@/lib/form-schemas";

type FormValues = z.infer<typeof registerSchema>;

const defaultValues: FormValues = {
  confirmPassword: "",
  email: "",
  name: "",
  password: "",
};

const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        if (value.password !== value.confirmPassword) {
          setRootError("Passwords do not match");
          return;
        }

        setIsLoading(true);
        setRootError(null);

        const result = await authClient.signUp.email({
          email: value.email,
          name: value.name,
          password: value.password,
        });

        if (result.error) {
          setRootError(result.error.message || "Failed to register");
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } catch {
        setRootError("An error occurred during registration. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    validators: {
      onSubmit: registerSchema,
    },
  });

  return (
    <BoneyardSkeleton
      fixture={
        <div className="space-y-4">
          <div className="h-10 w-full rounded bg-neutral-200" />
          <div className="h-10 w-full rounded bg-neutral-200" />
          <div className="h-10 w-full rounded bg-neutral-200" />
          <div className="h-10 w-full rounded bg-neutral-200" />
          <div className="h-10 w-full rounded bg-neutral-200" />
        </div>
      }
      loading={isLoading}
      name="register-form"
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
        <form.Field name="name">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
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
                  placeholder="Confirm your password"
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
          {isLoading ? "Creating account..." : "Register"}
        </Button>
      </form>
    </BoneyardSkeleton>
  );
};

export default RegisterForm;
