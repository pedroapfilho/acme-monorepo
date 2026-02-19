import { Context, Next } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { secureHeaders } from "hono/secure-headers";

// Enhanced security headers
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

// Rate limiting configurations
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
  keyGenerator: (c: Context) => {
    return (
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || c.env?.remoteAddr || "unknown"
    );
  },
  limit: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: "draft-6",
  windowMs: 15 * 60 * 1000, // 15 minutes
});

// Strict rate limiting for auth endpoints
export const authRateLimit = rateLimiter({
  handler: (c: Context) => {
    return c.json(
      {
        error: {
          code: "AUTH_RATE_LIMIT_EXCEEDED",
          message: "Too many authentication attempts, please try again later",
        },
      },
      429,
    );
  },
  keyGenerator: (c: Context) => {
    const ip =
      c.req.header("x-forwarded-for") ||
      c.req.header("x-real-ip") ||
      c.env?.remoteAddr ||
      "unknown";
    const path = c.req.path;
    return `${ip}:${path}`;
  },
  limit: 5, // limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: false,
  standardHeaders: "draft-6",
  windowMs: 15 * 60 * 1000, // 15 minutes
});

// API rate limiting
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
    const ip =
      c.req.header("x-forwarded-for") ||
      c.req.header("x-real-ip") ||
      c.env?.remoteAddr ||
      "unknown";
    return user?.id ? `user:${user.id}` : `ip:${ip}`;
  },
  limit: 30, // limit each IP to 30 requests per minute
  standardHeaders: "draft-6",
  windowMs: 1 * 60 * 1000, // 1 minute
});

// Request size limiting middleware
export const requestSizeLimit = (maxSize: number = 10 * 1024 * 1024) => {
  return async (c: Context, next: Next) => {
    const contentLength = c.req.header("content-length");

    if (contentLength && Number.parseInt(contentLength) > maxSize) {
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

    await next();
  };
};

// Request ID middleware for tracing
export const requestId = async (c: Context, next: Next) => {
  const requestId = c.req.header("x-request-id") || crypto.randomUUID();
  c.set("requestId", requestId);
  c.header("x-request-id", requestId);
  await next();
};
