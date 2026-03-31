import { describe, expect, it } from "vitest";
import { z } from "zod";

/**
 * Mirror the form schemas from the auth forms to test validation logic
 * in isolation without rendering React components.
 */

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(12, "Password must be at least 12 characters"),
});

const registerSchema = z.object({
  confirmPassword: z.string().min(12, "Password must be at least 12 characters"),
  email: z.string().email("Invalid email address"),
  name: z.string().min(3, "Name must be at least 3 characters").max(32),
  password: z.string().min(12, "Password must be at least 12 characters"),
});

const recoverSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  confirmPassword: z.string().min(12, "Password must be at least 12 characters"),
  password: z.string().min(12, "Password must be at least 12 characters"),
});

describe("loginSchema", () => {
  it("should accept valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "securepassword",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "securepassword",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "securepassword",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password shorter than 12 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("should accept password with exactly 12 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "123456789012",
    });
    expect(result.success).toBe(true);
  });
});

describe("registerSchema", () => {
  const validData = {
    confirmPassword: "securepassword",
    email: "user@example.com",
    name: "John Doe",
    password: "securepassword",
  };

  it("should accept valid registration data", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject name shorter than 3 characters", () => {
    const result = registerSchema.safeParse({ ...validData, name: "AB" });
    expect(result.success).toBe(false);
  });

  it("should reject name longer than 32 characters", () => {
    const result = registerSchema.safeParse({ ...validData, name: "A".repeat(33) });
    expect(result.success).toBe(false);
  });

  it("should accept name with exactly 3 characters", () => {
    const result = registerSchema.safeParse({ ...validData, name: "ABC" });
    expect(result.success).toBe(true);
  });

  it("should accept name with exactly 32 characters", () => {
    const result = registerSchema.safeParse({ ...validData, name: "A".repeat(32) });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = registerSchema.safeParse({ ...validData, email: "bad" });
    expect(result.success).toBe(false);
  });

  it("should reject short password", () => {
    const result = registerSchema.safeParse({ ...validData, password: "short" });
    expect(result.success).toBe(false);
  });

  it("should reject short confirm password", () => {
    const result = registerSchema.safeParse({ ...validData, confirmPassword: "short" });
    expect(result.success).toBe(false);
  });
});

describe("recoverSchema", () => {
  it("should accept valid email", () => {
    const result = recoverSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = recoverSchema.safeParse({ email: "not-email" });
    expect(result.success).toBe(false);
  });

  it("should reject empty email", () => {
    const result = recoverSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });

  it("should reject missing email", () => {
    const result = recoverSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("should accept valid passwords", () => {
    const result = resetPasswordSchema.safeParse({
      confirmPassword: "newpassword12",
      password: "newpassword12",
    });
    expect(result.success).toBe(true);
  });

  it("should reject short password", () => {
    const result = resetPasswordSchema.safeParse({
      confirmPassword: "newpassword12",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("should reject short confirmPassword", () => {
    const result = resetPasswordSchema.safeParse({
      confirmPassword: "short",
      password: "newpassword12",
    });
    expect(result.success).toBe(false);
  });

  it("should accept passwords with exactly 12 characters", () => {
    const result = resetPasswordSchema.safeParse({
      confirmPassword: "123456789012",
      password: "123456789012",
    });
    expect(result.success).toBe(true);
  });
});
