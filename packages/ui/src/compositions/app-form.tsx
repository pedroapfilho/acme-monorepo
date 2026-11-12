"use client";

import {
  createFormHook,
  createFormHookContexts,
  revalidateLogic,
  type StandardSchemaV1,
} from "@tanstack/react-form";
import { type ComponentProps, createContext, type ReactNode, use, useMemo } from "react";
import type { z } from "zod";

import { Field, FieldDescription, FieldGroup, FieldLabel } from "../components/field";
import { Input } from "../components/input";
import { focusFirstInvalidField } from "../lib/focus-first-invalid-field";

import { BusyButton, type BusyButtonProps } from "./busy-button";
import { ClientReadyForm } from "./client-ready-form";
import { FormAlert } from "./form-alert";
import { FormFieldError } from "./form-field-error";

const PendingContext = createContext(false);
const RequiredFieldsContext = createContext<ReadonlyArray<string>>([]);

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

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

const { useAppForm: useBoundForm, withFieldGroup } = createFormHook({
  fieldComponents: { TextField },
  fieldContext,
  formComponents: {},
  formContext,
});

type FormSchema<TValues> = StandardSchemaV1<TValues, unknown> &
  z.ZodObject<Record<string, z.ZodType>>;

type AppFormOptions<TValues> = {
  defaultValues: TValues;
  onChange: () => void;
  onSubmit: (values: TValues) => Promise<void>;
  onValidatorError: (error: Error) => void;
  schema: FormSchema<TValues>;
};

const useAppForm = <TValues,>({
  defaultValues,
  onChange,
  onSubmit,
  onValidatorError,
  schema,
}: AppFormOptions<TValues>) => {
  const requiredFields = useMemo(
    () =>
      Object.entries(schema.shape).flatMap(([name, fieldSchema]) =>
        fieldSchema.safeParse(undefined).success ? [] : [name],
      ),
    [schema],
  );

  const form = useBoundForm({
    defaultValues,
    listeners: { onChange },
    onSubmit: ({ value }) => onSubmit(value),
    onSubmitInvalid: ({ formApi }) => {
      const error = formApi.state.errorMap.onDynamic;

      if (error instanceof Error) {
        onValidatorError(error);

        return;
      }

      focusFirstInvalidField(formApi.formId);
    },
    validationLogic: revalidateLogic(),
    // Zod returns a rejected promise when a refinement throws, even for synchronous schemas.
    validators: { onDynamicAsync: schema },
  });

  return { form, requiredFields };
};

type FormSubmission = {
  errorMessage: string | null;
  formId: string;
  isPending: boolean;
  requiredFields: ReadonlyArray<string>;
  submit: () => Promise<void>;
};

const AppForm = ({ children, submission }: { children: ReactNode; submission: FormSubmission }) => (
  <ClientReadyForm
    id={submission.formId}
    noValidate
    onSubmit={(event) => {
      event.preventDefault();
      event.stopPropagation();
      void submission.submit();
    }}
  >
    <FormAlert message={submission.errorMessage} />
    <PendingContext value={submission.isPending}>
      <RequiredFieldsContext value={submission.requiredFields}>
        <FieldGroup>{children}</FieldGroup>
      </RequiredFieldsContext>
    </PendingContext>
  </ClientReadyForm>
);

const SubmitButton = (props: Omit<BusyButtonProps, "isPending" | "type">) => {
  const isPending = use(PendingContext);

  return <BusyButton {...props} isPending={isPending} type="submit" />;
};

export { AppForm, SubmitButton, useAppForm, withFieldGroup };
