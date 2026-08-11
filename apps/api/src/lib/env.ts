import { senderAddressSchema } from "@repo/transactional/sender-address";
import { z } from "zod";

export const envSchema = z.object({
  AUTH_ALLOWED_HOSTS: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().min(32),
  CI: z.string().optional(),
  CORS_ORIGINS: z.string().default("https://acme.web.localhost,https://acme.landing.localhost"),
  DATABASE_URL: z.string().min(1),
  FROM_EMAIL: senderAddressSchema,
  HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("4000"),
  RESEND_API_KEY: z.string().optional(),
  TRUSTED_ORIGINS: z.string().optional(),
  WEB_APP_URL: z.string().optional(),
});

const parseEnvList = (value: string | undefined): Array<string> => {
  if (value === undefined || value === "") {
    return [];
  }
  const result: Array<string> = [];
  for (const entry of value.split(",")) {
    const trimmed = entry.trim();
    if (trimmed.length > 0) {
      result.push(trimmed);
    }
  }
  return result;
};

const LOCALHOST_ALLOWED_HOSTS = ["**.localhost", "localhost:*", "127.0.0.1:*"];

// Plain http://localhost:PORT origins won't match allowedHosts patterns.
const LOOPBACK_TRUSTED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:4000",
];

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment variables:\n${JSON.stringify(z.treeifyError(parsedEnv.error), null, 2)}`,
  );
}

export const env = parsedEnv.data;

export const authAllowedHosts = [
  ...LOCALHOST_ALLOWED_HOSTS,
  ...parseEnvList(env.AUTH_ALLOWED_HOSTS),
];

export const authTrustedOrigins = [
  ...LOOPBACK_TRUSTED_ORIGINS,
  ...parseEnvList(env.TRUSTED_ORIGINS),
];
