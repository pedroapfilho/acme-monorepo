import pino from "pino";
import { pinoHttp } from "pino-http";

import { env } from "./env";

const logLevel = env.NODE_ENV === "production" ? "info" : "debug";

export const logger = pino({
  base: {
    env: env.NODE_ENV,
  },
  level: logLevel,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "res.headers"],
    remove: true,
  },
});

export const httpLogger = pinoHttp({
  autoLogging: {
    ignore: (req) => req.url === "/healthz",
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} - ${err.message}`;
  },
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return "warn";
    } else if (res.statusCode >= 500 || err) {
      return "error";
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return "silent";
    }
    return "info";
  },
  customSuccessMessage: (req, res) => {
    if (res.statusCode === 404) {
      return `${req.method} ${req.url} - Not Found`;
    }
    return `${req.method} ${req.url}`;
  },
  logger,
  serializers: {
    req: (req) => ({
      method: req.method,
      params: req.params,
      query: req.query,
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
      url: req.url,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});
