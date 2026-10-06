import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";

import { AppError } from "@/lib/api-error";

const MAX_BODY_BYTES = 10 * 1024 * 1024;

const securityHeaders = secureHeaders({
  contentSecurityPolicy: {
    connectSrc: ["'self'"],
    defaultSrc: ["'self'"],
    fontSrc: ["'self'"],
    frameSrc: ["'none'"],
    imgSrc: ["'self'", "data:", "https:"],
    mediaSrc: ["'self'"],
    objectSrc: ["'none'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
  },
  crossOriginEmbedderPolicy: "require-corp",
  crossOriginOpenerPolicy: "same-origin",
  crossOriginResourcePolicy: "cross-origin",
  originAgentCluster: "?1",
  referrerPolicy: "no-referrer-when-downgrade",
  strictTransportSecurity: "max-age=63072000; includeSubDomains; preload",
  xContentTypeOptions: "nosniff",
  xDnsPrefetchControl: "off",
  xDownloadOptions: "noopen",
  xFrameOptions: "DENY",
  xPermittedCrossDomainPolicies: "none",
  xXssProtection: "1; mode=block",
});

const requestSizeLimit = bodyLimit({
  maxSize: MAX_BODY_BYTES,
  onError: () => {
    throw new AppError("Request entity too large", "PAYLOAD_TOO_LARGE", 413);
  },
});

// A trusted proxy appends the peer it saw, so only the last X-Forwarded-For entry is not client-supplied.
const clientAddress = (c: Context, trustProxy: boolean): string => {
  if (trustProxy) {
    const proxiedAddress = c.req.header("x-forwarded-for")?.split(",").at(-1)?.trim();
    if (proxiedAddress !== undefined && proxiedAddress !== "") {
      return proxiedAddress;
    }
  }

  return getConnInfo(c).remote.address ?? "unknown";
};

type RateLimitOptions = {
  code: string;
  limit: number;
  message: string;
  windowMs: number;
};

const createRateLimit =
  (trustProxy: boolean) =>
  ({ code, limit, message, windowMs }: RateLimitOptions) =>
    rateLimiter({
      handler: () => {
        throw new AppError(message, code, 429);
      },
      keyGenerator: (c) => clientAddress(c, trustProxy),
      limit,
      standardHeaders: "draft-6",
      windowMs,
    });

export { createRateLimit, requestSizeLimit, securityHeaders };
