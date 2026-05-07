"use client";

import { Button } from "@repo/ui/components/button";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import type { AnyFieldApi } from "@tanstack/react-form";
import type { ComponentProps, ComponentType, FormEvent, ReactNode } from "react";

// Structural minimum of TanStack Form's ReactFormApi that this module needs:
// the typed Field render-prop and the imperative submit. Deliberately narrow
// so callers don't have to thread the 12-generic ReactFormApi through props,
// and so the seam is portable if TanStack Form's generic surface evolves.
type AuthFormApi = {
  Field: ComponentType<{
    children: (field: AnyFieldApi) => ReactNode;
    name: string;
  }>;
  handleSubmit: () => Promise<void>;
};

type AuthFormFieldProps = {
  disabled?: boolean;
  form: AuthFormApi;
  label: ReactNode;
  labelSlot?: ReactNode;
  name: string;
  placeholder?: string;
  type?: ComponentProps<"input">["type"];
};

// Each auth form (login/register/recover/reset-password) renders the same
// field shape: a `<form.Field>` render-prop, an `isInvalid = isTouched && !isValid`
// derivation, a `<Field>` carrying `data-invalid`, a `<FieldLabel>` linked to
// the input, an `<Input>` wired with aria-invalid + value/onChange/onBlur, and
// an `<FieldError>` that only renders once touched. Every callsite has to
// remember every wire — drift between callsites loses ARIA correctness silently.
//
// The deepening: callers pass `form`, `name`, `label`, optional `type` /
// `placeholder` / `disabled` / `labelSlot`. ARIA wiring, error rendering, the
// touched-then-show contract, and the disabled-during-submit semantics all
// live behind this seam. `labelSlot` lets login render its inline "Forgot
// password?" link next to the password label without poking holes in the API.
const AuthFormField = ({
  disabled,
  form,
  label,
  labelSlot,
  name,
  placeholder,
  type,
}: AuthFormFieldProps) => (
  <form.Field name={name}>
    {(field) => {
      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
      return (
        <Field data-invalid={isInvalid || undefined}>
          {labelSlot ? (
            <div className="flex items-center">
              <FieldLabel htmlFor={name}>{label}</FieldLabel>
              {labelSlot}
            </div>
          ) : (
            <FieldLabel htmlFor={name}>{label}</FieldLabel>
          )}
          <Input
            aria-invalid={isInvalid}
            disabled={disabled}
            id={name}
            name={field.name}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder={placeholder}
            type={type}
            value={field.state.value as string}
          />
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
      );
    }}
  </form.Field>
);

type AuthFormRootErrorProps = {
  message: string | null;
};

// Pulled out so the rendering contract (visible only when truthy, semantic
// tone via `text-destructive`) lives in one place rather than four.
const AuthFormRootError = ({ message }: AuthFormRootErrorProps) =>
  message ? <p className="text-sm text-destructive">{message}</p> : null;

type AuthFormProps = {
  children: ReactNode;
  form: AuthFormApi;
};

// Every auth form repeats the same submit handler: preventDefault +
// stopPropagation + `void form.handleSubmit()`. Concentrated here so the
// `<form>` element itself becomes the deep module's surface — callers compose
// fields inside without touching the imperative submit plumbing.
const AuthForm = ({ children, form }: AuthFormProps) => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    void form.handleSubmit();
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      {children}
    </form>
  );
};

type AuthFormSubmitProps = {
  isLoading: boolean;
  label: ReactNode;
  loadingLabel: ReactNode;
};

// The submit button is identical across forms — disabled while submitting,
// label flips to a loading variant. Behind the seam so the disabled/label
// contract stays consistent if it ever needs to grow (e.g. spinner icon).
const AuthFormSubmit = ({ isLoading, label, loadingLabel }: AuthFormSubmitProps) => (
  <Button disabled={isLoading} type="submit">
    {isLoading ? loadingLabel : label}
  </Button>
);

export { AuthForm, AuthFormField, AuthFormRootError, AuthFormSubmit };
export type { AuthFormFieldProps, AuthFormProps, AuthFormRootErrorProps, AuthFormSubmitProps };
