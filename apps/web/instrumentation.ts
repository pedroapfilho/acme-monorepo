import "zod/compile";

import { defineNodeInstrumentation } from "@repo/observability/next/instrumentation";

export const { onRequestError, register } = defineNodeInstrumentation(async () => {
  const [observability, { getEnv }] = await Promise.all([
    import("./src/lib/observability"),
    import("./src/lib/env"),
  ]);

  getEnv();

  return observability;
});
