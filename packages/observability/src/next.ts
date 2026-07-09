import "./fields";

import { createEvlog } from "evlog/next";
import { createInstrumentation } from "evlog/next/instrumentation/create";

import { buildConfig } from "./config";

const createObservability = (opts: { service: string }) => {
  const { redact, ...shared } = buildConfig(opts.service);
  // InstrumentationOptions lacks redact; only forward the shared subset.
  const next = createEvlog({ redact, service: opts.service, ...shared });
  const instrumentation = createInstrumentation({
    service: opts.service,
    ...shared,
    captureOutput: true,
  });
  return {
    createError: next.createError,
    log: next.log,
    onRequestError: instrumentation.onRequestError,
    register: instrumentation.register,
    useLogger: next.useLogger,
    withEvlog: next.withEvlog,
  };
};

export { createObservability };
export { evlogMiddleware } from "evlog/next";
