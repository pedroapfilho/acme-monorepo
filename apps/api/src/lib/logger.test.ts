import type { IncomingMessage, ServerResponse } from "node:http";

import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { NODE_ENV: "test" },
}));

vi.mock("pino", () => {
  const mockLogger = {
    child: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  };
  return { default: vi.fn(() => mockLogger) };
});

vi.mock("pino-http", () => ({
  pinoHttp: vi.fn((config) => config),
}));

import { pinoHttp } from "pino-http";

/**
 * Extract the httpLogger config options that were passed to pinoHttp
 * so we can unit-test the custom functions in isolation.
 */
const getHttpConfig = () => {
  const calls = vi.mocked(pinoHttp).mock.calls;
  return calls[0]?.[0] as {
    autoLogging: { ignore: (req: IncomingMessage) => boolean };
    customErrorMessage: (req: IncomingMessage, res: ServerResponse, err: Error) => string;
    customLogLevel: (req: IncomingMessage, res: ServerResponse, err?: Error) => string;
    customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => string;
  };
};

// Force module import to trigger mock calls
await import("./logger");

describe("httpLogger config", () => {
  const config = getHttpConfig();

  describe("autoLogging.ignore", () => {
    it("should skip logging for /healthz", () => {
      const req = { url: "/healthz" } as IncomingMessage;
      expect(config.autoLogging.ignore(req)).toBe(true);
    });

    it("should not skip logging for other routes", () => {
      const req = { url: "/api/users" } as IncomingMessage;
      expect(config.autoLogging.ignore(req)).toBe(false);
    });
  });

  describe("customLogLevel", () => {
    const req = { method: "GET", url: "/test" } as IncomingMessage;

    it("should return warn for 4xx responses", () => {
      const res = { statusCode: 400 } as ServerResponse;
      expect(config.customLogLevel(req, res)).toBe("warn");
    });

    it("should return warn for 404", () => {
      const res = { statusCode: 404 } as ServerResponse;
      expect(config.customLogLevel(req, res)).toBe("warn");
    });

    it("should return error for 5xx responses", () => {
      const res = { statusCode: 500 } as ServerResponse;
      expect(config.customLogLevel(req, res)).toBe("error");
    });

    it("should return error when err is present", () => {
      const res = { statusCode: 200 } as ServerResponse;
      expect(config.customLogLevel(req, res, new Error("boom"))).toBe("error");
    });

    it("should return silent for 3xx redirects", () => {
      const res = { statusCode: 301 } as ServerResponse;
      expect(config.customLogLevel(req, res)).toBe("silent");
    });

    it("should return info for 2xx responses", () => {
      const res = { statusCode: 200 } as ServerResponse;
      expect(config.customLogLevel(req, res)).toBe("info");
    });
  });

  describe("customSuccessMessage", () => {
    it("should return Not Found message for 404", () => {
      const req = { method: "GET", url: "/missing" } as IncomingMessage;
      const res = { statusCode: 404 } as ServerResponse;
      expect(config.customSuccessMessage(req, res)).toBe("GET /missing - Not Found");
    });

    it("should return method and url for other statuses", () => {
      const req = { method: "POST", url: "/api/users" } as IncomingMessage;
      const res = { statusCode: 200 } as ServerResponse;
      expect(config.customSuccessMessage(req, res)).toBe("POST /api/users");
    });
  });

  describe("customErrorMessage", () => {
    it("should include method, url, and error message", () => {
      const req = { method: "PUT", url: "/api/item" } as IncomingMessage;
      const res = {} as ServerResponse;
      const err = new Error("something broke");
      expect(config.customErrorMessage(req, res, err)).toBe("PUT /api/item - something broke");
    });
  });
});
