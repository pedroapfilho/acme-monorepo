import type { ComponentProps, ReactNode } from "react";

import { cn } from "../lib/utils";

type InputProps = Omit<ComponentProps<"input">, "className"> & {
  className?: string;
  endIcon?: ReactNode;
  startIcon?: ReactNode;
};

const inputBase =
  "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40";

function Input({ className, endIcon, startIcon, type, ...props }: InputProps) {
  if (startIcon || endIcon) {
    return (
      <div className={cn("relative", className)}>
        {startIcon && (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
            {startIcon}
          </span>
        )}
        <input
          className={cn(inputBase, startIcon ? "pl-10" : "px-3", endIcon ? "pr-10" : "")}
          data-slot="input"
          type={type}
          {...props}
        />
        {endIcon && (
          <span className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
            {endIcon}
          </span>
        )}
      </div>
    );
  }

  return (
    <input className={cn(inputBase, "px-3", className)} data-slot="input" type={type} {...props} />
  );
}

export { Input };
