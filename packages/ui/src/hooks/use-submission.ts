"use client";

import { useRef, useState, useTransition } from "react";

// A null message leaves the failure to the caller, which renders it from the code.
type SubmissionFailure = { code?: string; message: string | null };

type SubmissionOptions<TInput> = {
  onError?: (message: string) => void;
  onUnexpectedError: (cause: unknown) => void;
  run: (input: TInput) => Promise<SubmissionFailure | null>;
};

const UNEXPECTED_ERROR = "An error occurred. Please try again.";

const useSubmission = <TInput>({ onError, onUnexpectedError, run }: SubmissionOptions<TInput>) => {
  const [isPending, startTransition] = useTransition();
  const [failure, setFailure] = useState<SubmissionFailure | null>(null);
  const isLatched = useRef(false);

  const clearError = () => {
    setFailure(null);
  };

  const showFailure = (shown: SubmissionFailure) => {
    setFailure(shown);

    if (shown.message !== null) {
      onError?.(shown.message);
    }
  };

  const showUnexpectedError = (cause: unknown) => {
    onUnexpectedError(cause);
    showFailure({ message: UNEXPECTED_ERROR });
  };

  const perform = (input: TInput) =>
    new Promise<void>((resolve) => {
      startTransition(async () => {
        try {
          const result = await run(input);

          if (result !== null) {
            showFailure(result);
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
    errorCode: failure?.code ?? null,
    errorMessage: failure?.message ?? null,
    isPending,
    perform,
    showUnexpectedError,
  };
};

export { useSubmission };

export type { SubmissionFailure, SubmissionOptions };
