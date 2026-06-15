import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(12, "Password must be at least 12 characters"),
});

export const registerSchema = z
  .object({
    confirmPassword: z.string().min(12, "Password must be at least 12 characters"),
    email: z.email("Invalid email address"),
    name: z.string().min(3, "Name must be at least 3 characters").max(32),
    password: z.string().min(12, "Password must be at least 12 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const recoverSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    confirmPassword: z.string().min(12, "Password must be at least 12 characters"),
    password: z.string().min(12, "Password must be at least 12 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
