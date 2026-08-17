import type { Context } from "hono";
import { vi } from "vitest";

type CreateMockContextOptions = {
  headers?: Record<string, string>;
};

export type MockContextMocks = {
  get: ReturnType<typeof vi.fn>;
  header: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
  loggerError: ReturnType<typeof vi.fn>;
  loggerInfo: ReturnType<typeof vi.fn>;
  loggerSet: ReturnType<typeof vi.fn>;
  loggerWarn: ReturnType<typeof vi.fn>;
  reqHeader: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
};

export type MockContext = {
  ctx: Context;
  mocks: MockContextMocks;
};

export const createMockContext = (opts: CreateMockContextOptions = {}): MockContext => {
  const loggerError = vi.fn();
  const loggerInfo = vi.fn();
  const loggerSet = vi.fn();
  const loggerWarn = vi.fn();

  const evlogLogger = {
    error: loggerError,
    info: loggerInfo,
    set: loggerSet,
    warn: loggerWarn,
  };

  const variables = new Map<string, unknown>([["log", evlogLogger]]);
  const request = new Request("http://localhost/test", { headers: opts.headers });

  const mocks: MockContextMocks = {
    get: vi.fn((key: string) => variables.get(key)),
    header: vi.fn(),
    json: vi.fn((body: unknown, status?: number) => ({ body, status })),
    loggerError,
    loggerInfo,
    loggerSet,
    loggerWarn,
    reqHeader: vi.fn((name: string) => request.headers.get(name) ?? undefined),
    set: vi.fn((key: string, value: unknown) => {
      variables.set(key, value);
    }),
  };

  // oxlint-disable-next-line no-unsafe-type-assertion, anti-slop/no-chained-type-assertions -- Hono's Context is too large to mock structurally
  const ctx = {
    get: mocks.get,
    header: mocks.header,
    json: mocks.json,
    req: {
      header: mocks.reqHeader,
      method: "GET",
      path: "/test",
      raw: request,
      url: "http://localhost/test",
    },
    set: mocks.set,
  } as unknown as Context;

  return { ctx, mocks };
};
