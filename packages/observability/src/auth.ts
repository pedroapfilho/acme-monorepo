import "./fields";

import type { RequestLogger } from "evlog";
import { identifyUser } from "evlog/better-auth";
import type { IdentifyOptions } from "evlog/better-auth";

type ResolvedSession = Parameters<typeof identifyUser>[1];

// Takes the session the caller already resolved, so a request never looks it up twice.
const createIdentify =
  (options?: IdentifyOptions) =>
  (log: RequestLogger, session: ResolvedSession): boolean =>
    identifyUser(log, session, options);

export { createIdentify };
export type { ResolvedSession };
