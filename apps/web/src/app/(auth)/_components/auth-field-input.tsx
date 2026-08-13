"use client";

import { FieldError, useFieldContext } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";

type AuthFieldInputProps = {
  autoComplete: string;
  errors: Array<unknown>;
  id: string;
  isInvalid: boolean;
  isPending: boolean;
  name: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
};

const AuthFieldInput = ({
  autoComplete,
  errors,
  id,
  isInvalid,
  isPending,
  name,
  onBlur,
  onChange,
  placeholder,
  type = "text",
  value,
}: AuthFieldInputProps) => {
  const { id: fieldId } = useFieldContext();

  return (
    <>
      <Input
        aria-describedby={isInvalid ? `${fieldId}-error` : undefined}
        aria-invalid={isInvalid}
        autoComplete={autoComplete}
        disabled={isPending}
        id={id}
        name={name}
        onBlur={onBlur}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={placeholder}
        required
        type={type}
        value={value}
      />
      {isInvalid && <FieldError errors={errors} />}
    </>
  );
};

export { AuthFieldInput };
export type { AuthFieldInputProps };
