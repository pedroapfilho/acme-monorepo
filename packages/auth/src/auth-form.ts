"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import type { z } from "zod";

type UseAuthFormOptions<TValues> = {
  defaultValues: TValues;
  // Throw with a user-facing message to populate rootError. Anything else falls
  // back to a generic message so unexpected errors don't leak stack traces.
  onSubmit: (values: TValues) => Promise<void>;
  schema: z.ZodType<TValues, TValues>;
};

const GENERIC_ERROR_MESSAGE = "An error occurred. Please try again.";

const useAuthForm = <TValues>({ defaultValues, onSubmit, schema }: UseAuthFormOptions<TValues>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        setIsLoading(true);
        setRootError(null);
        await onSubmit(value);
      } catch (error) {
        const message = error instanceof Error ? error.message : GENERIC_ERROR_MESSAGE;
        setRootError(message);
      } finally {
        setIsLoading(false);
      }
    },
    validators: { onSubmit: schema },
  });

  return { form, isLoading, rootError };
};

export { useAuthForm };
export type { UseAuthFormOptions };
