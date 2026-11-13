"use client";

import { createFormHook, revalidateLogic, type StandardSchemaV1 } from "@tanstack/react-form";
import { useMemo } from "react";
import type { z } from "zod";

import { TextField } from "../compositions/text-field";
import { focusFirstInvalidField } from "../lib/focus-first-invalid-field";
import { fieldContext, formContext } from "../lib/form-context";

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

const useAppForm = <TValues>({
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

export { useAppForm, withFieldGroup };
