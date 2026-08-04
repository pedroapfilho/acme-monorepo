import { senderAddressSchema } from "@repo/transactional/sender-address";
import { z } from "zod";

const envSchema = z.object({
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters (openssl rand -base64 32)"),
  // Same schema the mailer enforces, so a typo fails on parse rather than on every send.
  FROM_EMAIL: senderAddressSchema,
  RESEND_API_KEY: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | undefined;

// Parsed on first read, not at import: Next's build-time page-data workers import
// this module without runtime env set, and a module-scope throw would fail the build.
const getEnv = (): Env => {
  if (!cachedEnv) {
    const parsedEnv = envSchema.safeParse(process.env);

    if (!parsedEnv.success) {
      throw new Error(
        `Invalid environment variables:\n${JSON.stringify(z.treeifyError(parsedEnv.error), null, 2)}`,
      );
    }

    cachedEnv = parsedEnv.data;
  }

  return cachedEnv;
};

export { getEnv };
