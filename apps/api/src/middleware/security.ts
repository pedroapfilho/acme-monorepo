import type { Context, Next } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { secureHeaders } from "hono/secure-headers";

const getClientIp = (c: Context): string =>
  c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || c.env?.remoteAddr || "unknown";

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
    return c.json(
      {
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests, please try again later",
        },
      },
      429,
    );
  },
  keyGenerator: (c: Context) => getClientIp(c),
  limit: 100,
  standardHeaders: "draft-6",
  windowMs: 15 * 60 * 1000, // 15 minutes
});

export const apiRateLimit = rateLimiter({
  handler: (c: Context) => {
    return c.json(
      {
        error: {
          code: "API_RATE_LIMIT_EXCEEDED",
          message: "API rate limit exceeded, please slow down",
        },
      },
      429,
    );
  },
  keyGenerator: (c: Context) => {
    const user = c.get("user");
    return user?.id ? `user:${user.id}` : `ip:${getClientIp(c)}`;
  },
  limit: 30,
  standardHeaders: "draft-6",
  windowMs: 1 * 60 * 1000, // 1 minute
});

export const requestSizeLimit = (maxSize: number = 10 * 1024 * 1024) => {
  return async (c: Context, next: Next) => {
    const contentLength = c.req.header("content-length");

    if (contentLength && Number.parseInt(contentLength, 10) > maxSize) {
      return c.json(
        {
          error: {
            code: "PAYLOAD_TOO_LARGE",
            message: "Request entity too large",
          },
        },
        413,
      );
    }

    return await next();
  };
};
