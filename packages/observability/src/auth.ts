import "./fields";

import type { identifyUser } from "evlog/better-auth";

type ResolvedSession = Parameters<typeof identifyUser>[1];

export { identifyUser } from "evlog/better-auth";
export type { ResolvedSession };
