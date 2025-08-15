import { cn } from "../lib/utils";
import { ComponentProps, cloneElement, ReactElement } from "react";

type InputProps = Omit<ComponentProps<"input">, "className"> & {
  className?: string;
  startIcon?: ReactElement<{ className?: string }>;
  endIcon?: ReactElement<{ className?: string }>;
};

function Input({ className, type, startIcon, endIcon, ...props }: InputProps) {
  if (startIcon || endIcon) {
    return (
      <div className={cn("relative", className)}>
        {startIcon && (
          <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 transform">
            {cloneElement(startIcon, {
              className: cn("h-4 w-4", startIcon?.props?.className),
            })}
          </div>
        )}
        <input
          type={type}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            startIcon ? "pl-10" : "px-3",
            endIcon ? "pr-10" : startIcon ? "" : "px-3",
          )}
          {...props}
        />
        {endIcon && (
          <div className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 transform">
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
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
