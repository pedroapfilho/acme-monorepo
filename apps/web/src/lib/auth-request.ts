import type { SubmissionFailure } from "@repo/ui/hooks/use-submission";

type AuthError = { code?: string; message?: string };

type AuthResult<TData> = { data: TData | null; error: AuthError | null };

type AuthRequestOptions<TInput, TData> = {
  call: (input: TInput) => Promise<AuthResult<TData>>;
  fallbackError: string;
  handledErrorCodes?: ReadonlyArray<string>;
  onSuccess?: (data: TData, input: TInput) => Promise<void> | void;
};

const failureOf = (
  error: AuthError | null,
  fallbackError: string,
  handledErrorCodes: ReadonlyArray<string>,
): SubmissionFailure => {
  const code = error?.code;
  const isHandled = code !== undefined && handledErrorCodes.includes(code);

  return { code, message: isHandled ? null : (error?.message ?? fallbackError) };
};

const authRequest =
  <TInput, TData>({
    call,
    fallbackError,
    handledErrorCodes = [],
    onSuccess,
  }: AuthRequestOptions<TInput, TData>) =>
  async (input: TInput) => {
    const { data, error } = await call(input);

    if (error !== null || data === null) {
      return failureOf(error, fallbackError, handledErrorCodes);
    }

    await onSuccess?.(data, input);

    return null;
  };

export { authRequest };

export type { AuthRequestOptions };
