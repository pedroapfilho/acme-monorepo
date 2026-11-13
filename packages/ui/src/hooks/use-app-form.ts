"use client";

import { createFormHook, revalidateLogic, type StandardSchemaV1 } from "@tanstack/react-form";
import { useMemo } from "react";
import type { z } from "zod";

import { TextField } from "../compositions/text-field";
import { focusFirstInvalidField } from "../lib/focus-first-invalid-field";
import { fieldContext, formContext } from "../lib/form-context";

import { type SubmissionOptions, useSubmission } from "./use-submission";

const { useAppForm: useBoundForm, withFieldGroup } = createFormHook({
  fieldComponents: { TextField },
  fieldContext,
  formComponents: {},
  formContext,
});

type FormSchema<TValues> = StandardSchemaV1<TValues, unknown> &
  z.ZodObject<Record<string, z.ZodType>>;

type AppFormOptions<TValues> = Omit<SubmissionOptions<TValues>, "onError"> & {
  defaultValues: TValues;
  schema: FormSchema<TValues>;
};

const useAppForm = <TValues>({
  defaultValues,
  schema,
  ...submissionOptions
}: AppFormOptions<TValues>) => {
  const { attempt, clearError, errorCode, errorMessage, isPending, perform, showUnexpectedError } =
    useSubmission(submissionOptions);

  const requiredFields = useMemo(
    () =>
      Object.entries(schema.shape).flatMap(([name, fieldSchema]) =>
        fieldSchema.safeParse(undefined).success ? [] : [name],
      ),
    [schema],
  );

  const form = useBoundForm({
    defaultValues,
    listeners: { onChange: clearError },
    onSubmit: ({ value }) => perform(value),
    onSubmitInvalid: ({ formApi }) => {
      const error = formApi.state.errorMap.onDynamic;

      if (error instanceof Error) {
        showUnexpectedError(error);

        return;
      }

      focusFirstInvalidField(formApi.formId);
    },
    validationLogic: revalidateLogic(),
    // Zod returns a rejected promise when a refinement throws, even for synchronous schemas.
    validators: { onDynamicAsync: schema },
  });

  const submission = {
    errorMessage,
    formId: form.formId,
    isPending,
    requiredFields,
    submit: () => attempt(() => form.handleSubmit()),
  };

  return { errorCode, form, submission };
};

export { useAppForm, withFieldGroup };
