import { createLogger, initLogger } from "evlog";
import { buildConfig } from "./config";
import "./fields";

/** Initialize the global evlog logger for a long-running BullMQ worker process. */
const initWorkerLogger = (opts: { service: string }): void => {
  initLogger(buildConfig(opts.service));
};

/** Per-job wide-event logger seeded with job context. Call `.emit()` when the job settles. */
const createJobLogger = (ctx: Record<string, unknown>) => createLogger(ctx);

export { createJobLogger, initWorkerLogger };
