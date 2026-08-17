import { DEFAULT_CORS_ORIGINS } from "@repo/auth/env-config";
import { senderAddressSchema } from "@repo/transactional/sender-address";
import { z } from "zod";

// AUTH_ALLOWED_HOSTS, TRUSTED_ORIGINS, WEB_APP_URL and CI are deliberately absent: envAuthConfig()
// owns them and reads process.env directly, so declaring them here only implies an owner that isn't.
export const envSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  CORS_ORIGINS: z.string().default(DEFAULT_CORS_ORIGINS.join(",")),
  DATABASE_URL: z.string().min(1),
  FROM_EMAIL: senderAddressSchema,
  HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("4000"),
  RESEND_API_KEY: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment variables:\n${JSON.stringify(z.treeifyError(parsedEnv.error), null, 2)}`,
  );
}

export const env = parsedEnv.data;
