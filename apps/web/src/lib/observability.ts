import { createObservability } from "@repo/observability/next";

export const { onRequestError, register } = createObservability({ service: "web" });
