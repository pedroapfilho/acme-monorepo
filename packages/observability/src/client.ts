"use client";

import { initLog, log, setIdentity } from "evlog/client";

import { buildConfig } from "./config";

// `evlog/next` statically imports node:async_hooks and patches stdout/stderr, so client
// components must go through evlog's browser logger instead of createObservability().
const createClientObservability = (opts: { service: string }) => {
  const { enabled, env, minLevel, pretty } = buildConfig(opts.service);
  initLog({ enabled, minLevel, pretty, service: opts.service });
  setIdentity({ environment: env.environment });
  return { log };
};

export { createClientObservability };
