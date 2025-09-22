import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3001"),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().default("http://localhost:3001"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  TRUSTED_ORIGINS: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:");
  console.error(z.treeifyError(parsedEnv.error));
  process.exit(1);
}

export const env = parsedEnv.data;
