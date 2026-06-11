import "./fields";

import { initLogger, log } from "evlog";
import { evlog, type EvlogVariables } from "evlog/hono";

import { buildConfig } from "./config";

/** Initialize the global evlog logger for a long-running Hono (Railway) service. */
const initApiLogger = (opts: { service: string }): void => {
  initLogger(buildConfig(opts.service));
};

/** Per-request wide-event middleware. Sets `c.get("log")`. */
const honoEvlog = () => evlog();

// The API needs a module-level `log` for startup/shutdown lines without importing
// `@repo/observability/next` (which is React-coupled). Re-exported from evlog root.
export { honoEvlog, initApiLogger, log };
export type { EvlogVariables };
