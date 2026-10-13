import { z } from "zod";

const email = z.email("Invalid email address");
const name = z.string().min(3, "Name must be at least 3 characters").max(32);
const password = z.string().min(12, "Password must be at least 12 characters");

type PasswordKey = "newPassword" | "password";

const withPasswordConfirmation = <
  TSchema extends z.ZodType<{ confirmPassword: string } & Partial<Record<PasswordKey, string>>>,
>(
  schema: TSchema,
  passwordKey: PasswordKey,
) =>
  schema.refine((data) => data[passwordKey] === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({ email, password });

export const registerSchema = withPasswordConfirmation(
  z.object({ confirmPassword: password, email, name, password }),
  "password",
);

export const recoverSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export const resetPasswordSchema = withPasswordConfirmation(
  z.object({ confirmPassword: password, password }),
  "password",
);

export const profileSchema = z.object({ name });

export const changeEmailSchema = z.object({ email });

export const changePasswordSchema = withPasswordConfirmation(
  z.object({ confirmPassword: password, currentPassword: password, newPassword: password }),
  "newPassword",
);

export const deleteAccountSchema = z.object({ password });
