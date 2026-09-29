"use client";

import { createClientObservability } from "@repo/observability/client";

export const { log } = createClientObservability({ service: "landing" });
