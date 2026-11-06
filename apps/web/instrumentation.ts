import "zod/compile";

import { defineNodeInstrumentation } from "@repo/observability/next/instrumentation";

export const { onRequestError, register } = defineNodeInstrumentation(async () => {
  const observability = await import("./src/lib/observability");

  // Next also bundles this file for the edge runtime; the literal check lets it drop the Node-only auth graph there.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getAuth } = await import("./src/lib/auth");
    getAuth();
  }

  return observability;
});
