import { defineNodeInstrumentation } from "@repo/observability/next/instrumentation";

export const { onRequestError, register } = defineNodeInstrumentation(
  () => import("./src/lib/observability"),
);
