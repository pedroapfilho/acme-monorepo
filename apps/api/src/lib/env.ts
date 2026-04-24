import { z } from "zod";

export const envSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().default("http://localhost:4000"),
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:3001"),
  DATABASE_URL: z.string().min(1),
  FROM_EMAIL: z.string().default("noreply@acme.com"),
  HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("4000"),
  RESEND_API_KEY: z.string().optional(),
  TRUSTED_ORIGINS: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  // Throwing at module load aborts the process with a stack trace; preferable to
  // process.exit which loses context and conflicts with unicorn/no-process-exit.
  throw new Error(
    `Invalid environment variables:\n${JSON.stringify(z.treeifyError(parsedEnv.error), null, 2)}`,
  );
}

export const env = parsedEnv.data;
