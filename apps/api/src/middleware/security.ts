import { Context, Next } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { secureHeaders } from "hono/secure-headers";

// Enhanced security headers
export const securityHeaders = secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: "draft-6",
  keyGenerator: (c: Context) => {
    return (
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || c.env?.remoteAddr || "unknown"
    );
  },
  handler: (c: Context) => {
    return c.json(
      {
        error: {
          message: "Too many requests, please try again later",
          code: "RATE_LIMIT_EXCEEDED",
        },
      },
      429,
    );
  },
});

// Strict rate limiting for auth endpoints
export const authRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: false,
  standardHeaders: "draft-6",
  keyGenerator: (c: Context) => {
    const ip =
      c.req.header("x-forwarded-for") ||
      c.req.header("x-real-ip") ||
      c.env?.remoteAddr ||
      "unknown";
    const path = c.req.path;
    return `${ip}:${path}`;
  },
  handler: (c: Context) => {
    return c.json(
      {
        error: {
          message: "Too many authentication attempts, please try again later",
          code: "AUTH_RATE_LIMIT_EXCEEDED",
        },
      },
      429,
    );
  },
});

// API rate limiting
export const apiRateLimit = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 30, // limit each IP to 30 requests per minute
  standardHeaders: "draft-6",
  keyGenerator: (c: Context) => {
    const user = c.get("user");
    const ip =
      c.req.header("x-forwarded-for") ||
      c.req.header("x-real-ip") ||
      c.env?.remoteAddr ||
      "unknown";
    return user?.id ? `user:${user.id}` : `ip:${ip}`;
  },
  handler: (c: Context) => {
    return c.json(
      {
        error: {
          message: "API rate limit exceeded, please slow down",
          code: "API_RATE_LIMIT_EXCEEDED",
        },
      },
      429,
    );
  },
});

// Request size limiting middleware
export const requestSizeLimit = (maxSize: number = 10 * 1024 * 1024) => {
  return async (c: Context, next: Next) => {
    const contentLength = c.req.header("content-length");

    if (contentLength && parseInt(contentLength) > maxSize) {
      return c.json(
        {
          error: {
            message: "Request entity too large",
            code: "PAYLOAD_TOO_LARGE",
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
