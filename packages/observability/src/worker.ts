import "./fields";

import { initLogger } from "evlog";

import { buildConfig } from "./config";

const initWorkerLogger = (opts: { service: string }): void => {
  initLogger(buildConfig(opts.service));
};

export { initWorkerLogger };
