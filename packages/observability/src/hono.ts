import "./fields";

import { initLogger } from "evlog";
import { evlog } from "evlog/hono";

import { buildConfig } from "./config";

const initApiLogger = (opts: { service: string }): void => {
  initLogger(buildConfig(opts.service));
};

const honoEvlog = () => evlog();

// API re-exports evlog's log to avoid importing React-coupled @repo/observability/next.
export { honoEvlog, initApiLogger };
export { log } from "evlog";
export type { EvlogVariables } from "evlog/hono";
