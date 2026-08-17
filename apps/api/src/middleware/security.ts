import type { Context, Next } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { secureHeaders } from "hono/secure-headers";

import { errorBody } from "@/lib/api-error";

const getClientIp = (c: Context): string => {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded !== undefined && forwarded !== "") {
    return forwarded;
  }
  const realIp = c.req.header("x-real-ip");
  if (realIp !== undefined && realIp !== "") {
    return realIp;
  }
  return "unknown";
};

export { getClientIp };

export const securityHeaders = secureHeaders({
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

export const standardRateLimit = rateLimiter({
  handler: (c: Context) => {
    c.res = c.json(
      errorBody("RATE_LIMIT_EXCEEDED", "Too many requests, please try again later"),
      429,
    );
  },
  keyGenerator: getClientIp,
  limit: 100,
  standardHeaders: "draft-6",
  windowMs: 15 * 60 * 1000,
});

// Keyed by IP, not by user: both limiters are registered app-level in index.ts and run before the
// route-level authMiddleware, so no user is on the context yet when the key is computed.
export const apiRateLimit = rateLimiter({
  handler: (c: Context) => {
    c.res = c.json(
      errorBody("API_RATE_LIMIT_EXCEEDED", "API rate limit exceeded, please slow down"),
      429,
    );
  },
  keyGenerator: getClientIp,
  limit: 30,
  standardHeaders: "draft-6",
  windowMs: 1 * 60 * 1000,
});

export const requestSizeLimit = (maxSize: number = 10 * 1024 * 1024) => {
  return async (c: Context, nextHandler: Next) => {
    const contentLength = c.req.header("content-length");

    if (
      contentLength !== undefined &&
      contentLength !== "" &&
      Math.trunc(Number(contentLength)) > maxSize
    ) {
      c.res = c.json(errorBody("PAYLOAD_TOO_LARGE", "Request entity too large"), 413);
      return;
    }

    await nextHandler();
  };
};
