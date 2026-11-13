import { canonicalUrls, localHostPatterns, loopbackOrigins } from "@repo/portless-env/apps";
import { z } from "zod";

type EnvAuthConfigOptions = {
  additionalAllowedHosts?: Array<string>;
  additionalTrustedOrigins?: Array<string>;
  secureUrl?: string;
};

type EnvAuthConfig = {
  allowedHosts: Array<string>;
  rateLimitEnabled: boolean;
  trustedOrigins: Array<string>;
  useSecureCookies: boolean;
  webAppUrl: string | undefined;
};

const list = (fallback: Array<string> = []) =>
  z
    .string()
    .default(fallback.join(","))
    .transform((value) =>
      value
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0),
    );

const authEnv = z.object({
  AUTH_ALLOWED_HOSTS: list(),
  AUTH_RATE_LIMIT: z.enum(["", "off"]).optional(),
  // Unset means the local defaults, empty means no origin; the api's CORS allowlist reads the same value.
  CORS_ORIGINS: list(canonicalUrls("CORS_ORIGINS")),
  NODE_ENV: z.string().optional(),
  TRUSTED_ORIGINS: list(),
  WEB_APP_URL: z
    .string()
    .optional()
    .transform((value) => (value === "" ? undefined : value))
    .refine((value) => value === undefined || URL.canParse(value), {
      message: "WEB_APP_URL must be a valid URL",
    }),
});

type AuthEnv = z.output<typeof authEnv>;

const envAuthConfig = (env: AuthEnv, options: EnvAuthConfigOptions = {}): EnvAuthConfig => {
  const secureUrl = options.secureUrl ?? env.WEB_APP_URL;

  return {
    allowedHosts: [
      ...localHostPatterns,
      ...env.AUTH_ALLOWED_HOSTS,
      ...(options.additionalAllowedHosts ?? []),
    ],
    rateLimitEnabled: env.NODE_ENV === "production" && env.AUTH_RATE_LIMIT !== "off",
    trustedOrigins: [
      ...loopbackOrigins,
      ...env.CORS_ORIGINS.filter((origin) => origin !== "*"),
      ...env.TRUSTED_ORIGINS,
      ...(options.additionalTrustedOrigins ?? []),
    ],
    useSecureCookies: secureUrl !== undefined && URL.parse(secureUrl)?.protocol === "https:",
    webAppUrl: env.WEB_APP_URL,
  };
};

export { authEnv, envAuthConfig };

export type { AuthEnv, EnvAuthConfig, EnvAuthConfigOptions };
