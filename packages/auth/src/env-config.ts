const LOCALHOST_ALLOWED_HOSTS = ["**.localhost", "localhost:*", "127.0.0.1:*"];

const LOOPBACK_TRUSTED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:4000",
];

// Also the fallback for the api's CORS allowlist; a zod `.default()` there would be invisible here,
// leaving Hono and Better Auth disagreeing about which origins are allowed.
const DEFAULT_CORS_ORIGINS = ["https://acme.web.localhost", "https://acme.landing.localhost"];

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
};

const parseEnvList = (value: string | undefined): Array<string> => {
  if (value === undefined || value === "") {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

const envAuthConfig = (options: EnvAuthConfigOptions = {}): EnvAuthConfig => {
  const corsTrustedOrigins =
    process.env.CORS_ORIGINS === undefined
      ? DEFAULT_CORS_ORIGINS
      : parseEnvList(process.env.CORS_ORIGINS).filter((origin) => origin !== "*");

  return {
    allowedHosts: [
      ...LOCALHOST_ALLOWED_HOSTS,
      ...parseEnvList(process.env.AUTH_ALLOWED_HOSTS),
      ...(options.additionalAllowedHosts ?? []),
    ],
    rateLimitEnabled:
      process.env.NODE_ENV === "production" &&
      (process.env.CI === undefined || process.env.CI === ""),
    trustedOrigins: [
      ...LOOPBACK_TRUSTED_ORIGINS,
      ...corsTrustedOrigins,
      ...parseEnvList(process.env.TRUSTED_ORIGINS),
      ...(options.additionalTrustedOrigins ?? []),
    ],
    useSecureCookies:
      (options.secureUrl ?? process.env.WEB_APP_URL)?.startsWith("https://") === true,
  };
};

export { DEFAULT_CORS_ORIGINS, envAuthConfig, parseEnvList };
export type { EnvAuthConfig, EnvAuthConfigOptions };
