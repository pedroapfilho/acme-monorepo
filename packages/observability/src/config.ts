import type { LogLevel } from "evlog";

type NodeEnv = "development" | "production" | "test";

const resolveEnv = (raw: string | undefined): NodeEnv =>
  raw === "production" || raw === "test" ? raw : "development";

const buildConfig = (service: string, nodeEnv = process.env.NODE_ENV) => {
  const environment = resolveEnv(nodeEnv);
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
