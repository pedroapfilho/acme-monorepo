"use client";

import { useAppForm } from "@repo/ui/hooks/use-app-form";

import { type AuthRequestOptions, authRequest } from "@/lib/auth-request";
import { reportError } from "@/lib/observability-client";

type AuthFormOptions<TValues, TData> = AuthRequestOptions<TValues, TData> &
  Pick<Parameters<typeof useAppForm<TValues>>[0], "defaultValues" | "schema">;

const useAuthForm = <TValues, TData>({
  defaultValues,
  schema,
  ...request
}: AuthFormOptions<TValues, TData>) =>
  useAppForm({
    defaultValues,
    onUnexpectedError: reportError,
    run: authRequest(request),
    schema,
  });

export { useAuthForm };
