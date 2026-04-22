import type { ComponentProps, ReactElement } from "react";
import { cloneElement } from "react";

import { cn } from "../lib/utils";

type InputProps = Omit<ComponentProps<"input">, "className"> & {
  className?: string;
  endIcon?: ReactElement<{ className?: string }>;
  startIcon?: ReactElement<{ className?: string }>;
};

const resolveTrailingPad = (hasEnd: boolean, hasStart: boolean) => {
  if (hasEnd) {
    return "pr-10";
  }
  if (hasStart) {
    return "";
  }
  return "px-3";
};

function Input({ className, endIcon, startIcon, type, ...props }: InputProps) {
  if (startIcon || endIcon) {
    return (
      <div className={cn("relative", className)}>
        {startIcon && (
          <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 transform text-muted-foreground">
            {cloneElement(startIcon, {
              className: cn("h-4 w-4", startIcon?.props?.className),
            })}
          </div>
        )}
        <input
          className={cn(
            "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
            startIcon ? "pl-10" : "px-3",
            resolveTrailingPad(Boolean(endIcon), Boolean(startIcon)),
          )}
          data-slot="input"
          type={type}
          {...props}
        />
        {endIcon && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2 transform text-muted-foreground">
            {cloneElement(endIcon, {
              className: cn("h-4 w-4", endIcon?.props?.className),
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <input
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      data-slot="input"
      type={type}
      {...props}
    />
  );
}

export { Input };
