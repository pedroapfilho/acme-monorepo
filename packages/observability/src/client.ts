"use client";

import { initLog, log, setIdentity } from "evlog/client";

import { buildConfig } from "./config";
import { serializeError } from "./serialize-error";

const reportError = (cause: unknown) => {
  const serialized = serializeError(cause);
  log.error({ error: serialized, message: serialized.message });
};

const createClientObservability = (opts: { service: string }) => {
  const { enabled, env, minLevel, pretty } = buildConfig(opts.service);
  initLog({ enabled, minLevel, pretty, service: opts.service });
  setIdentity({ environment: env.environment });

  return { log, reportError };
};

export { createClientObservability };
