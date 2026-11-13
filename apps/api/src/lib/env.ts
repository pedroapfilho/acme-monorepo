import { authEnv } from "@repo/auth/env-config";
import { apps } from "@repo/portless-env/apps";
import { z } from "zod";

export const envSchema = z.object({
  ...authEnv.shape,
  BETTER_AUTH_SECRET: z.string().min(32),
  DATABASE_URL: z.string().min(1),
  HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(apps.api.port),
  TRUSTED_PROXY_HOPS: z.coerce.number().int().nonnegative().default(0),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment variables:\n${JSON.stringify(z.treeifyError(parsedEnv.error), null, 2)}`,
  );
}

export const env = parsedEnv.data;
