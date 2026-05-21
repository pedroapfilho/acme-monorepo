"use client";

import { type ComponentProps, createContext, use, useId } from "react";

import { cn } from "../lib/utils";

type FieldContextValue = { id: string };
const FieldContext = createContext<FieldContextValue>({ id: "" });
const useFieldContext = () => use(FieldContext);

const Field = ({ className, ...props }: ComponentProps<"div">) => {
  const id = useId();
  return (
    <FieldContext value={{ id }}>
      <div className={cn("flex flex-col gap-2", className)} {...props} />
    </FieldContext>
  );
};

const FieldGroup = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cn("flex flex-col gap-4", className)} {...props} />
);

const FieldLabel = ({ className, htmlFor, ...props }: ComponentProps<"label">) => {
  const { id } = useFieldContext();
  return (
    <label
      className={cn(
        "text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      htmlFor={htmlFor ?? id}
      {...props}
    />
  );
};

const FieldContent = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cn("flex flex-col gap-1", className)} {...props} />
);

const FieldDescription = ({ className, ...props }: ComponentProps<"p">) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);

const FieldError = ({
  className,
  errors,
  ...props
}: ComponentProps<"p"> & { errors?: Array<unknown> }) => {
  const { id } = useFieldContext();
  if (!errors || errors.length === 0) {
    return null;
  }
  const messages = errors.reduce<Array<string>>((acc, e) => {
    if (!e) {
      return acc;
    }
    if (typeof e === "string") {
      acc.push(e);
      return acc;
    }
    if (typeof e === "object" && "message" in e) {
      acc.push((e as { message: string }).message);
      return acc;
    }
    acc.push(String(e));
    return acc;
  }, []);
  if (messages.length === 0) {
    return null;
  }
  return (
    <p
      className={cn("text-sm font-medium text-destructive", className)}
      id={`${id}-error`}
      role="alert"
      {...props}
    >
      {messages.join(", ")}
    </p>
  );
};

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  useFieldContext,
};
