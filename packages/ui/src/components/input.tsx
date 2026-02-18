import { ComponentProps, cloneElement, ReactElement } from "react";

import { cn } from "../lib/utils";

type InputProps = Omit<ComponentProps<"input">, "className"> & {
  className?: string;
  startIcon?: ReactElement<{ className?: string }>;
  endIcon?: ReactElement<{ className?: string }>;
};

function Input({ className, type, startIcon, endIcon, ...props }: InputProps) {
  if (startIcon || endIcon) {
    return (
      <div className={cn("ui:relative", className)}>
        {startIcon && (
          <div className="ui:text-muted-foreground ui:pointer-events-none ui:absolute ui:top-1/2 ui:left-3 ui:-translate-y-1/2 ui:transform">
            {cloneElement(startIcon, {
              className: cn("ui:h-4 ui:w-4", startIcon?.props?.className),
            })}
          </div>
        )}
        <input
          type={type}
          data-slot="input"
          className={cn(
            "file:ui:text-foreground placeholder:ui:text-muted-foreground selection:ui:bg-primary selection:ui:text-primary-foreground ui:dark:bg-input/30 ui:border-input ui:flex ui:h-9 ui:w-full ui:min-w-0 ui:rounded-md ui:border ui:bg-transparent ui:py-1 ui:text-base ui:shadow-xs ui:transition-[color,box-shadow] ui:outline-none file:ui:inline-flex file:ui:h-7 file:ui:border-0 file:ui:bg-transparent file:ui:text-sm file:ui:font-medium ui:disabled:pointer-events-none ui:disabled:cursor-not-allowed ui:disabled:opacity-50 ui:md:text-sm",
            "ui:focus-visible:border-ring ui:focus-visible:ring-ring/50 ui:focus-visible:ring-[3px]",
            "ui:aria-invalid:ring-destructive/20 ui:dark:aria-invalid:ring-destructive/40 ui:aria-invalid:border-destructive",
            startIcon ? "ui:pl-10" : "ui:px-3",
            endIcon ? "ui:pr-10" : startIcon ? "" : "ui:px-3",
          )}
          {...props}
        />
        {endIcon && (
          <div className="ui:text-muted-foreground ui:absolute ui:top-1/2 ui:right-3 ui:-translate-y-1/2 ui:transform">
            {cloneElement(endIcon, {
              className: cn("ui:h-4 ui:w-4", endIcon?.props?.className),
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:ui:text-foreground placeholder:ui:text-muted-foreground selection:ui:bg-primary selection:ui:text-primary-foreground ui:dark:bg-input/30 ui:border-input ui:flex ui:h-9 ui:w-full ui:min-w-0 ui:rounded-md ui:border ui:bg-transparent ui:px-3 ui:py-1 ui:text-base ui:shadow-xs ui:transition-[color,box-shadow] ui:outline-none file:ui:inline-flex file:ui:h-7 file:ui:border-0 file:ui:bg-transparent file:ui:text-sm file:ui:font-medium ui:disabled:pointer-events-none ui:disabled:cursor-not-allowed ui:disabled:opacity-50 ui:md:text-sm",
        "ui:focus-visible:border-ring ui:focus-visible:ring-ring/50 ui:focus-visible:ring-[3px]",
        "ui:aria-invalid:ring-destructive/20 ui:dark:aria-invalid:ring-destructive/40 ui:aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
