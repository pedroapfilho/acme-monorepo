import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";

type Props = {
  disabled: boolean;
  field: {
    handleBlur: () => void;
    handleChange: (value: string) => void;
    name: string;
    state: {
      meta: { errors: Array<unknown>; isTouched: boolean; isValid: boolean };
      value: string;
    };
  };
  label: string;
};

const AuthPasswordField = ({ disabled, field, label }: Props) => {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errorId = `${field.name}-error`;

  return (
    <Field data-invalid={isInvalid || undefined}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        aria-describedby={isInvalid ? errorId : undefined}
        aria-invalid={isInvalid}
        autoComplete="new-password"
        disabled={disabled}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(event) => {
          field.handleChange(event.target.value);
        }}
        required
        type="password"
        value={field.state.value}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} id={errorId} />}
    </Field>
  );
};

export { AuthPasswordField };
