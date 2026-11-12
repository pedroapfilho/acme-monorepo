"use client";

import { createClientObservability } from "@repo/observability/client";

export const { reportError } = createClientObservability({ service: "landing" });
