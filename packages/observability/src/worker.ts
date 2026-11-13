import "./fields";

import { createLogger, initLogger } from "evlog";

import { buildConfig } from "./config";

const initWorkerLogger = (opts: { service: string }): void => {
  initLogger(buildConfig(opts.service));
};

const createJobLogger = (context: Parameters<typeof createLogger>[0]) => createLogger(context);

export { createJobLogger, initWorkerLogger };
