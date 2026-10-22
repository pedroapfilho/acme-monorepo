"use client";

import { Button } from "@repo/ui/components/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { ClientReadyForm } from "@repo/ui/compositions/client-ready-form";
import { FormAlert } from "@repo/ui/compositions/form-alert";
import { FormFieldError } from "@repo/ui/compositions/form-field-error";
import { useClientReady } from "@repo/ui/hooks/use-client-ready";
import { focusFirstInvalidField } from "@repo/ui/lib/focus-first-invalid-field";
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
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import type { z } from "zod";

import { log } from "@/lib/observability-client";

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

const PendingContext = createContext(false);
const RequiredFieldsContext = createContext<ReadonlyArray<string>>([]);

const inputTypes = {
  "current-password": "password",
  email: "email",
  name: "text",
  "new-password": "password",
} as const;

type TextFieldProps = {
  autoComplete: keyof typeof inputTypes;
  description?: string;
  id?: string;
  label: string;
  labelAction?: ReactNode;
  placeholder?: string;
};

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

const TextField = ({
  autoComplete,
  description,
  id,
  label,
  labelAction,
  placeholder,
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
        type={inputTypes[autoComplete]}
        value={field.state.value}
      />
      {description !== undefined && (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      )}
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
  schema: z.ZodObject<Record<string, z.ZodType>> & StandardSchemaV1<TValues, unknown>;
};

const useAuthForm = <TValues, TData>({
  defaultValues,
  schema,
  ...requestOptions
}: AuthFormOptions<TValues, TData>) => {
  const { attempt, clearError, errorCode, errorMessage, isPending, perform, showUnexpectedError } =
    useAuthRequest(requestOptions);
  const requiredFields = useMemo(
    () =>
      Object.entries(schema.shape).flatMap(([name, fieldSchema]) =>
        fieldSchema.safeParse(undefined).success ? [] : [name],
      ),
    [schema],
  );
  const form = useAppForm({
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

type Submission = ReturnType<typeof useAuthForm>["submission"];

const LiveRegion = ({ message }: { message: string | null }) => (
  <div aria-atomic="true" aria-live="polite" className="sr-only">
    {message}
  </div>
);

const AuthForm = ({ children, submission }: { children: ReactNode; submission: Submission }) => (
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
    onError: (message) => {
      toast.error(message);
    },
    onSuccess,
  });
  const ready = useClientReady();

  return (
    <>
      <LiveRegion message={errorMessage} />
      <BusyButton
        {...props}
        disabled={!ready || isPending}
        isPending={isPending}
        onClick={() => {
          void attempt(perform);
        }}
      />
    </>
  );
};

export { AuthActionButton, AuthForm, SubmitButton, useAuthForm };
