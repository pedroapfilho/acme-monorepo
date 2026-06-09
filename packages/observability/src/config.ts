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
  const isDev = environment === "development";
  return {
    drain: undefined,
    enabled: true,
    env: { environment, service },
    minLevel: isDev ? ("debug" as const) : ("info" as const),
    pretty: isDev,
    redact: !isDev,
  };
};

type ObservabilityConfig = ReturnType<typeof buildConfig>;

export { buildConfig };
export type { ObservabilityConfig };
