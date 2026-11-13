"use client";

import { BusyButton, type BusyButtonProps } from "@repo/ui/compositions/busy-button";
import { useClientReady } from "@repo/ui/hooks/use-client-ready";
import { useSubmission } from "@repo/ui/hooks/use-submission";
import { toast } from "sonner";

import { type AuthRequestOptions, authRequest } from "@/lib/auth-request";
import { reportError } from "@/lib/observability-client";

const LiveRegion = ({ message }: { message: string | null }) => (
  <div aria-atomic="true" aria-live="polite" className="sr-only">
    {message}
  </div>
);

type AuthActionButtonProps<TData> = Omit<BusyButtonProps, "isPending" | "onClick"> &
  Omit<AuthRequestOptions<void, TData>, "handledErrorCodes">;

const AuthActionButton = <TData,>({
  call,
  fallbackError,
  onSuccess,
  ...props
}: AuthActionButtonProps<TData>) => {
  const { attempt, errorMessage, isPending, perform } = useSubmission({
    onError: (message) => {
      toast.error(message);
    },
    onUnexpectedError: reportError,
    run: authRequest({ call, fallbackError, onSuccess }),
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

export { AuthActionButton };
