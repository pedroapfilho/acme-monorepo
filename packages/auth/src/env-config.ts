import { canonicalUrls, localHostPatterns, loopbackOrigins } from "@repo/portless-env/apps";

// Also the fallback for the api's CORS allowlist; a zod `.default()` there would be invisible here,
// leaving Hono and Better Auth disagreeing about which origins are allowed.
const DEFAULT_CORS_ORIGINS = canonicalUrls("CORS_ORIGINS");

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

const parseEnvList = (value: string | undefined): Array<string> => {
  if (value === undefined || value === "") {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

const webAppUrl = (): string | undefined => {
  const value = process.env.WEB_APP_URL;
  if (value === undefined || value === "") {
    return undefined;
  }
  if (!URL.canParse(value)) {
    throw new Error("WEB_APP_URL must be a valid URL");
  }
  return value;
};

const envAuthConfig = (options: EnvAuthConfigOptions = {}): EnvAuthConfig => {
  const corsTrustedOrigins =
    process.env.CORS_ORIGINS === undefined
      ? DEFAULT_CORS_ORIGINS
      : parseEnvList(process.env.CORS_ORIGINS).filter((origin) => origin !== "*");
  const appUrl = webAppUrl();
  const secureUrl = options.secureUrl ?? appUrl;

  return {
    allowedHosts: [
      ...localHostPatterns,
      ...parseEnvList(process.env.AUTH_ALLOWED_HOSTS),
      ...(options.additionalAllowedHosts ?? []),
    ],
    rateLimitEnabled:
      process.env.NODE_ENV === "production" &&
      (process.env.CI === undefined || process.env.CI === ""),
    trustedOrigins: [
      ...loopbackOrigins,
      ...corsTrustedOrigins,
      ...parseEnvList(process.env.TRUSTED_ORIGINS),
      ...(options.additionalTrustedOrigins ?? []),
    ],
    useSecureCookies: secureUrl !== undefined && URL.parse(secureUrl)?.protocol === "https:",
    webAppUrl: appUrl,
  };
};

export { DEFAULT_CORS_ORIGINS, envAuthConfig, parseEnvList, webAppUrl };
export type { EnvAuthConfig, EnvAuthConfigOptions };
