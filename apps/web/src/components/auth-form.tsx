"use client";

import { Button } from "@repo/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { FormFieldError } from "@repo/ui/compositions/form-field-error";
import {
  createFormHook,
  createFormHookContexts,
  revalidateLogic,
  type StandardSchemaV1,
} from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  use,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import { log } from "@/lib/observability-client";

type AuthResult<TData> = {
  data: TData | null;
  error: { code?: string; message?: string } | null;
};

type AuthRequestOptions<TInput, TData> = {
  call: (input: TInput) => Promise<AuthResult<TData>>;
  fallbackError: string;
  handledErrorCodes?: ReadonlyArray<string>;
  onSuccess?: (data: TData, input: TInput) => Promise<void> | void;
};

const UNEXPECTED_ERROR = "An error occurred. Please try again.";

const useAuthRequest = <TInput, TData>({
  call,
  fallbackError,
  handledErrorCodes = [],
  onSuccess,
}: AuthRequestOptions<TInput, TData>) => {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const isLatched = useRef(false);

  const showError = (message: string) => {
    setErrorMessage(message);
    toast.error(message);
  };

  const showUnexpectedError = (cause: unknown) => {
    log.error({
      error: cause instanceof Error ? cause.message : String(cause),
      message: "Auth request failed",
    });
    showError(UNEXPECTED_ERROR);
  };

  const perform = (input: TInput) =>
    new Promise<void>((resolve) => {
      startTransition(async () => {
        try {
          const { data, error } = await call(input);
          if (error === null && data !== null) {
            await onSuccess?.(data, input);
          } else {
            const code = error?.code ?? null;
            setErrorCode(code);
            if (code === null || !handledErrorCodes.includes(code)) {
              showError(error?.message ?? fallbackError);
            }
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
    setErrorMessage(null);
    setErrorCode(null);
    try {
      await work();
    } catch (error) {
      showUnexpectedError(error);
    } finally {
      isLatched.current = false;
    }
  };

  return { attempt, errorCode, errorMessage, isPending, perform };
};

const PendingContext = createContext(false);

const inputTypes = {
  "current-password": "password",
  email: "email",
  name: "text",
  "new-password": "password",
} as const;

type TextFieldProps = {
  autoComplete: keyof typeof inputTypes;
  id?: string;
  label: string;
  labelAction?: ReactNode;
  placeholder?: string;
};

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

const TextField = ({ autoComplete, id, label, labelAction, placeholder }: TextFieldProps) => {
  const field = useFieldContext<string>();
  const isPending = use(PendingContext);
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const inputId = id ?? field.name;
  const errorId = `${inputId}-error`;
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
        aria-describedby={isInvalid ? errorId : undefined}
        aria-invalid={isInvalid}
        aria-required
        autoComplete={autoComplete}
        disabled={isPending}
        id={inputId}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(event) => {
          field.handleChange(event.target.value);
        }}
        placeholder={placeholder}
        type={inputTypes[autoComplete]}
        value={field.state.value}
      />
      {isInvalid && <FormFieldError errors={field.state.meta.errors} id={errorId} />}
    </Field>
  );
};

const { useAppForm } = createFormHook({
  fieldComponents: { TextField },
  fieldContext,
  formComponents: {},
  formContext,
});

type AuthFormOptions<TValues, TData> = AuthRequestOptions<TValues, TData> & {
  defaultValues: TValues;
  schema: StandardSchemaV1<TValues, unknown>;
};

/**
 * Validates on submit, then on every change. Literal `onBlur` + `onChange` validators keep a
 * blur error after the value is fixed, and that stale error blocks Enter-to-submit.
 */
const useAuthForm = <TValues, TData>({
  defaultValues,
  schema,
  ...requestOptions
}: AuthFormOptions<TValues, TData>) => {
  const { attempt, errorCode, errorMessage, isPending, perform } = useAuthRequest(requestOptions);
  const form = useAppForm({
    defaultValues,
    onSubmit: ({ value }) => perform(value),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
  });

  const submission = {
    errorMessage,
    isPending,
    submit: () => attempt(() => form.handleSubmit()),
  };

  return { errorCode, form, submission };
};

type Submission = ReturnType<typeof useAuthForm>["submission"];

const LiveRegion = ({ message }: { message: string | null }) => (
  <div aria-atomic="true" aria-live="polite" className="sr-only">
    {message}
  </div>
);

const AuthForm = ({ children, submission }: { children: ReactNode; submission: Submission }) => (
  <form
    noValidate
    onSubmit={(event) => {
      event.preventDefault();
      event.stopPropagation();
      void submission.submit();
    }}
  >
    <LiveRegion message={submission.errorMessage} />
    <PendingContext value={submission.isPending}>
      <FieldGroup>{children}</FieldGroup>
    </PendingContext>
  </form>
);

type BusyButtonProps = ComponentProps<typeof Button> & { isPending: boolean; pendingLabel: string };

const BusyButton = ({ children, isPending, pendingLabel, ...props }: BusyButtonProps) => (
  <Button aria-busy={isPending} disabled={isPending} {...props}>
    {isPending && <Loader2 className="size-4 motion-safe:animate-spin" />}
    {isPending ? pendingLabel : children}
  </Button>
);

const SubmitButton = (props: Omit<BusyButtonProps, "isPending" | "type">) => {
  const isPending = use(PendingContext);
  return <BusyButton {...props} isPending={isPending} type="submit" />;
};

type AuthActionButtonProps<TData> = Omit<BusyButtonProps, "isPending" | "onClick"> &
  Omit<AuthRequestOptions<void, TData>, "handledErrorCodes">;

const AuthActionButton = <TData,>({
  call,
  fallbackError,
  onSuccess,
  ...props
}: AuthActionButtonProps<TData>) => {
  const { attempt, errorMessage, isPending, perform } = useAuthRequest({
    call,
    fallbackError,
    onSuccess,
  });

  return (
    <>
      <LiveRegion message={errorMessage} />
      <BusyButton
        {...props}
        isPending={isPending}
        onClick={() => {
          void attempt(perform);
        }}
      />
    </>
  );
};

export { AuthActionButton, AuthForm, SubmitButton, useAuthForm };
