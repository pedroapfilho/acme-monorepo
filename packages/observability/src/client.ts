"use client";

import { initLog, log, setIdentity } from "evlog/client";

import { buildConfig } from "./config";

const createClientObservability = (opts: { service: string }) => {
  const { enabled, env, minLevel, pretty } = buildConfig(opts.service);
  initLog({ enabled, minLevel, pretty, service: opts.service });
  setIdentity({ environment: env.environment });
  return { log };
};

export { createClientObservability };
