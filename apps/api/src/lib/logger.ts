import pino from "pino";

import { env } from "./env";

const logLevel = env.NODE_ENV === "production" ? "info" : "debug";

const logger = pino({
  base: {
    env: env.NODE_ENV,
  },
  level: logLevel,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "res.headers"],
    remove: true,
  },
  transport: env.NODE_ENV === "production" ? undefined : { target: "pino-pretty" },
});

export { logger };
