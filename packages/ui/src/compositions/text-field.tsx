"use client";

import { type ComponentProps, type ReactNode, use } from "react";

import { Field, FieldDescription, FieldLabel } from "../components/field";
import { Input } from "../components/input";
import { PendingContext, RequiredFieldsContext, useFieldContext } from "../lib/form-context";

import { FormFieldError } from "./form-field-error";

type TextFieldProps = Pick<
  ComponentProps<typeof Input>,
  "autoComplete" | "placeholder" | "type"
> & {
  description?: string;
  id?: string;
  label: string;
  labelAction?: ReactNode;
};

const TextField = ({
  autoComplete,
  description,
  id,
  label,
  labelAction,
  placeholder,
  type = "text",
}: TextFieldProps) => {
  const field = useFieldContext<string>();
  const isPending = use(PendingContext);
  const requiredFields = use(RequiredFieldsContext);
  const isInvalid = !field.state.meta.isValid;
  const inputId = id ?? field.name;
  const errorId = `${inputId}-error`;
  const descriptionId = `${inputId}-description`;

  const describedBy = [description === undefined ? null : descriptionId, isInvalid ? errorId : null]
    .filter((describer) => describer !== null)
    .join(" ");

  const fieldLabel = <FieldLabel htmlFor={inputId}>{label}</FieldLabel>;

  return (
    <Field data-invalid={isInvalid || undefined}>
      {labelAction === undefined ? (
        fieldLabel
      ) : (
        <div className="flex items-center">
          {fieldLabel}
          {labelAction}
        </div>
      )}
      <Input
        aria-describedby={describedBy === "" ? undefined : describedBy}
        aria-invalid={isInvalid}
        aria-required={requiredFields.includes(field.name)}
        autoComplete={autoComplete}
        disabled={isPending}
        id={inputId}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(event) => {
          field.handleChange(event.target.value);
        }}
        placeholder={placeholder}
        type={type}
        value={field.state.value}
      />
      {description !== undefined && (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      )}
      {isInvalid && <FormFieldError errors={field.state.meta.errors} id={errorId} />}
    </Field>
  );
};

export { TextField };
