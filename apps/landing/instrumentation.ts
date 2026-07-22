import { defineNodeInstrumentation } from "@repo/observability/next/instrumentation";

export const { onRequestError, register } = defineNodeInstrumentation(async () => {
  const observability = await import("./src/lib/observability");
  return observability;
});
