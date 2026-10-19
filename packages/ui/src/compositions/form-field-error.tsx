import type { ComponentProps } from "react";

import { FieldError } from "../components/field";

type FormFieldErrorProps = Omit<ComponentProps<typeof FieldError>, "errors"> & {
  errors?: Array<unknown>;
};

const FormFieldError = ({ errors, ...props }: FormFieldErrorProps) => {
  const messages = errors?.flatMap((error) => {
    if (error === undefined || error === null) {
      return [];
    }
    if (typeof error === "string") {
      return [{ message: error }];
    }
    if (typeof error === "object" && "message" in error && typeof error.message === "string") {
      return [{ message: error.message }];
    }
    if (typeof error === "number" || typeof error === "bigint" || typeof error === "boolean") {
      return [{ message: String(error) }];
    }
    return [];
  });

  return <FieldError errors={messages} {...props} />;
};

export { FormFieldError };
