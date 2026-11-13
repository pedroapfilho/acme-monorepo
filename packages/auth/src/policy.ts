import { z } from "zod";

const NAME_LENGTH = { max: 32, min: 3 } as const;
const PASSWORD_LENGTH = { max: 128, min: 12 } as const;
const USERNAME_LENGTH = { max: 30, min: 3 } as const;

const email = z.email("Enter a valid email address");

const name = z
  .string()
  .min(NAME_LENGTH.min, `Name must be at least ${NAME_LENGTH.min} characters`)
  .max(NAME_LENGTH.max, `Name must be at most ${NAME_LENGTH.max} characters`)
  .describe(`${NAME_LENGTH.min} to ${NAME_LENGTH.max} characters.`);

const newPassword = z
  .string()
  .min(PASSWORD_LENGTH.min, `Password must be at least ${PASSWORD_LENGTH.min} characters`)
  .max(PASSWORD_LENGTH.max, `Password must be at most ${PASSWORD_LENGTH.max} characters`)
  .describe(`At least ${PASSWORD_LENGTH.min} characters.`);

// Only the server judges a password that already exists, so raising the minimum never locks its owner out at a form.
const existingPassword = z.string().min(1, "Enter your password");

const username = z
  .string()
  .min(USERNAME_LENGTH.min, `Username must be at least ${USERNAME_LENGTH.min} characters`)
  .max(USERNAME_LENGTH.max, `Username must be at most ${USERNAME_LENGTH.max} characters`)
  .regex(/^[\w.]+$/v, "Username can only contain letters, numbers, underscores and dots")
  .describe(
    `${USERNAME_LENGTH.min} to ${USERNAME_LENGTH.max} characters: letters, numbers, underscores and dots.`,
  );

export {
  email,
  existingPassword,
  name,
  NAME_LENGTH,
  newPassword,
  PASSWORD_LENGTH,
  username,
  USERNAME_LENGTH,
};
