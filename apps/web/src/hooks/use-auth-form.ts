"use client";

import { useAppForm } from "@repo/ui/hooks/use-app-form";
import { useRef, useState, useTransition } from "react";

import { reportError } from "@/lib/observability-client";

type AuthResult<TData> = {
  data: TData | null;
  error: { code?: string; message?: string } | null;
};

type AuthRequestOptions<TInput, TData> = {
  call: (input: TInput) => Promise<AuthResult<TData>>;
  fallbackError: string;
  handledErrorCodes?: ReadonlyArray<string>;
  onError?: (message: string) => void;
  onSuccess?: (data: TData, input: TInput) => Promise<void> | void;
};

const UNEXPECTED_ERROR = "An error occurred. Please try again.";

const useAuthRequest = <TInput, TData>({
  call,
  fallbackError,
  handledErrorCodes = [],
  onError,
  onSuccess,
}: AuthRequestOptions<TInput, TData>) => {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const isLatched = useRef(false);

  const clearError = () => {
    setErrorMessage(null);
    setErrorCode(null);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    onError?.(message);
  };

  const showUnexpectedError = (cause: unknown) => {
    reportError(cause);
    showError(UNEXPECTED_ERROR);
  };

  const showFailure = (error: AuthResult<TData>["error"]) => {
    const code = error?.code ?? null;
    setErrorCode(code);

    if (code === null || !handledErrorCodes.includes(code)) {
      showError(error?.message ?? fallbackError);
    }
  };

  const perform = (input: TInput) =>
    new Promise<void>((resolve) => {
      startTransition(async () => {
        try {
          const { data, error } = await call(input);

          if (error === null && data !== null) {
            await onSuccess?.(data, input);
          } else {
            showFailure(error);
          }
        } catch (error) {
          showUnexpectedError(error);
        }

        resolve();
      });
    });

  // The ref closes the window before `isPending` re-renders, so a second event in the same frame is dropped.
  const attempt = async (work: () => Promise<void>) => {
    if (isPending || isLatched.current) {
      return;
    }

    isLatched.current = true;
    clearError();

    try {
      await work();
    } catch (error) {
      showUnexpectedError(error);
    }

    isLatched.current = false;
  };

  return {
    attempt,
    clearError,
    errorCode,
    errorMessage,
    isPending,
    perform,
    showUnexpectedError,
  };
};

type AuthFormOptions<TValues, TData> = AuthRequestOptions<TValues, TData> &
  Pick<Parameters<typeof useAppForm<TValues>>[0], "defaultValues" | "schema">;

const useAuthForm = <TValues, TData>({
  defaultValues,
  schema,
  ...requestOptions
}: AuthFormOptions<TValues, TData>) => {
  const { attempt, clearError, errorCode, errorMessage, isPending, perform, showUnexpectedError } =
    useAuthRequest(requestOptions);

  const { form, requiredFields } = useAppForm({
    defaultValues,
    onChange: clearError,
    onSubmit: perform,
    onValidatorError: showUnexpectedError,
    schema,
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

export { useAuthForm, useAuthRequest };

export type { AuthRequestOptions };
