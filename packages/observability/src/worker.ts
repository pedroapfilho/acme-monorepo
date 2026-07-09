import "./fields";

import { createLogger, initLogger } from "evlog";

import { buildConfig } from "./config";

const initWorkerLogger = (opts: { service: string }): void => {
  initLogger(buildConfig(opts.service));
};

const createJobLogger = (ctx: Record<string, unknown>) => createLogger(ctx);

export { createJobLogger, initWorkerLogger };
