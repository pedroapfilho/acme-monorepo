import { email, existingPassword, name, newPassword } from "@repo/auth/policy";
import { z } from "zod";

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

export const loginSchema = z.object({ email, password: existingPassword });

export const registerSchema = withPasswordConfirmation(
  z.object({ confirmPassword: newPassword, email, name, password: newPassword }),
  "password",
);

export const recoverSchema = z.object({ email });

export const resetPasswordSchema = withPasswordConfirmation(
  z.object({ confirmPassword: newPassword, password: newPassword }),
  "password",
);

export const profileSchema = z.object({ name });

export const changeEmailSchema = z.object({ email });

export const changePasswordSchema = withPasswordConfirmation(
  z.object({ confirmPassword: newPassword, currentPassword: existingPassword, newPassword }),
  "newPassword",
);

export const deleteAccountSchema = z.object({ password: existingPassword });
