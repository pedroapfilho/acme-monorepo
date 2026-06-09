import type { LogLevel } from "evlog";

type NodeEnv = "development" | "production" | "test";

const resolveEnv = (raw: string | undefined): NodeEnv =>
  raw === "production" || raw === "test" ? raw : "development";

/**
 * The single observability config. Dev gets readable wide events; prod degrades
 * to a plain compact line with PII redaction. No external drain — evlog's own
 * console output is the only sink (captured by Vercel/Railway platform logs).
 * `nodeEnv` is injected for testability; callers pass `process.env.NODE_ENV`.
 */
const buildConfig = (service: string, nodeEnv = process.env.NODE_ENV) => {
  const environment = resolveEnv(nodeEnv);
  // Only prod redacts and compacts; test mirrors development for debuggability.
  const isProd = environment === "production";
  const minLevel: LogLevel = isProd ? "info" : "debug";
  return {
    drain: undefined,
    enabled: true,
    env: { environment, service },
    minLevel,
    pretty: !isProd,
    redact: isProd,
  };
};

type ObservabilityConfig = ReturnType<typeof buildConfig>;

export { buildConfig };
export type { ObservabilityConfig };
