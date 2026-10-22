import type { ComponentProps, ReactNode } from "react";

import { cn } from "../lib/utils";

type FormAlertProps = Omit<ComponentProps<"p">, "children" | "role"> & {
  message: NonNullable<ReactNode> | null;
};

const FormAlert = ({ className, message, ...props }: FormAlertProps) =>
  message === null ? null : (
    <p
      className={cn(
        "rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive",
        className,
      )}
      data-slot="form-alert"
      role="alert"
      {...props}
    >
      {message}
    </p>
  );

export { FormAlert };
