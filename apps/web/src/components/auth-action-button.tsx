"use client";

import { BusyButton, type BusyButtonProps } from "@repo/ui/compositions/busy-button";
import { useClientReady } from "@repo/ui/hooks/use-client-ready";
import { toast } from "sonner";

import { type AuthRequestOptions, useAuthRequest } from "@/hooks/use-auth-form";

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

export { AuthActionButton };
