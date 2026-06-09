import { createEvlog, evlogMiddleware } from "evlog/next";
import { createInstrumentation } from "evlog/next/instrumentation";
import { buildConfig } from "./config";
import "./fields";

/** Per-app Next factory. Returns request-scoped helpers + instrumentation hooks. */
const createObservability = (opts: { service: string }) => {
  const { redact, ...shared } = buildConfig(opts.service);
  // `NextEvlogOptions` accepts the full config (incl. `redact`); `InstrumentationOptions`
  // does not have a `redact` key, so only the shared subset is forwarded there.
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

export { createObservability, evlogMiddleware };
