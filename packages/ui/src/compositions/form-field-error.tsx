import type { ComponentProps } from "react";

import { FieldError } from "../components/field";

type FormFieldErrorProps = Omit<ComponentProps<typeof FieldError>, "errors"> & {
  errors?: Array<unknown>;
};

const PRINTABLE_TYPES = new Set(["string", "number", "bigint", "boolean"]);

const FormFieldError = ({ errors, ...props }: FormFieldErrorProps) => {
  const messages = errors?.flatMap((error) => {
    if (PRINTABLE_TYPES.has(typeof error)) {
      return [{ message: String(error) }];
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return [{ message: error.message }];
    }

    return [];
  });

  return <FieldError errors={messages} {...props} />;
};

export { FormFieldError };
