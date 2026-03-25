"use client";

import { type ComponentProps, createContext, forwardRef, useContext, useId } from "react";

import { cn } from "../lib/utils";

type FieldContextValue = { id: string };
const FieldContext = createContext<FieldContextValue>({ id: "" });
const useFieldContext = () => useContext(FieldContext);

const Field = forwardRef<HTMLDivElement, ComponentProps<"div">>(({ className, ...props }, ref) => {
  const id = useId();
  return (
    <FieldContext.Provider value={{ id }}>
      <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props} />
    </FieldContext.Provider>
  );
});
Field.displayName = "Field";

const FieldGroup = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-4", className)} {...props} />
  ),
);
FieldGroup.displayName = "FieldGroup";

const FieldLabel = forwardRef<HTMLLabelElement, ComponentProps<"label">>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  ),
);
FieldLabel.displayName = "FieldLabel";

const FieldContent = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props} />
  ),
);
FieldContent.displayName = "FieldContent";

const FieldDescription = forwardRef<HTMLParagraphElement, ComponentProps<"p">>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
FieldDescription.displayName = "FieldDescription";

const FieldError = forwardRef<
  HTMLParagraphElement,
  ComponentProps<"p"> & { errors?: Array<unknown> }
>(({ className, errors, ...props }, ref) => {
  if (!errors || errors.length === 0) {
    return null;
  }
  const messages = errors
    .filter(Boolean)
    .map((e) =>
      typeof e === "string"
        ? e
        : typeof e === "object" && e !== null && "message" in e
          ? (e as { message: string }).message
          : String(e),
    );
  if (messages.length === 0) {
    return null;
  }
  return (
    <p ref={ref} className={cn("text-sm font-medium text-destructive", className)} {...props}>
      {messages.join(", ")}
    </p>
  );
});
FieldError.displayName = "FieldError";

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  useFieldContext,
};
