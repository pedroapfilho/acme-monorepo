import { describe, expect, it, vi } from "vitest";

vi.stubEnv("BETTER_AUTH_SECRET", "a".repeat(32));
vi.stubEnv("DATABASE_URL", "postgresql://user:pass@localhost:5432/db");

const { envSchema } = await import("./env");

const validEnv = {
  BETTER_AUTH_SECRET: "a".repeat(32),
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
};

describe("envSchema", () => {
  it("should accept valid environment variables", () => {
    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
  });

  it("should apply default values", () => {
    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.BETTER_AUTH_URL).toBe("http://localhost:4000");
      expect(result.data.PORT).toBe("4000");
      expect(result.data.HOST).toBe("0.0.0.0");
      expect(result.data.NODE_ENV).toBe("development");
      expect(result.data.FROM_EMAIL).toBe("noreply@acme.com");
      expect(result.data.CORS_ORIGINS).toBe("http://localhost:3000,http://localhost:3001");
    }
  });

  it("should reject missing BETTER_AUTH_SECRET", () => {
    const result = envSchema.safeParse({ DATABASE_URL: "postgresql://localhost/db" });
    expect(result.success).toBe(false);
  });

  it("should reject BETTER_AUTH_SECRET shorter than 32 characters", () => {
    const result = envSchema.safeParse({
      BETTER_AUTH_SECRET: "short",
      DATABASE_URL: "postgresql://localhost/db",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing DATABASE_URL", () => {
    const result = envSchema.safeParse({ BETTER_AUTH_SECRET: "a".repeat(32) });
    expect(result.success).toBe(false);
  });

  it("should reject empty DATABASE_URL", () => {
    const result = envSchema.safeParse({
      BETTER_AUTH_SECRET: "a".repeat(32),
      DATABASE_URL: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid NODE_ENV values", () => {
    const result = envSchema.safeParse({
      ...validEnv,
      NODE_ENV: "staging",
    });
    expect(result.success).toBe(false);
  });

  it("should accept all valid NODE_ENV values", () => {
    for (const nodeEnv of ["development", "production", "test"]) {
      const result = envSchema.safeParse({ ...validEnv, NODE_ENV: nodeEnv });
      expect(result.success).toBe(true);
    }
  });

  it("should allow optional RESEND_API_KEY", () => {
    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.RESEND_API_KEY).toBeUndefined();
    }
  });

  it("should allow optional TRUSTED_ORIGINS", () => {
    const result = envSchema.safeParse({ ...validEnv, TRUSTED_ORIGINS: "https://example.com" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.TRUSTED_ORIGINS).toBe("https://example.com");
    }
  });
});
