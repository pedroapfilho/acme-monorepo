import "./fields";

import { initLogger } from "evlog";
import { evlog } from "evlog/hono";

import { buildConfig } from "./config";

const initApiLogger = (opts: { service: string }): void => {
  initLogger(buildConfig(opts.service));
};

const honoEvlog = () => evlog();

export { honoEvlog, initApiLogger };
export { log } from "evlog";
export type { EvlogVariables } from "evlog/hono";
