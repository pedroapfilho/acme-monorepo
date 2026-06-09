import { createObservability } from "@repo/observability/next";

export const { createError, log, onRequestError, register, useLogger, withEvlog } =
  createObservability({ service: "landing" });
