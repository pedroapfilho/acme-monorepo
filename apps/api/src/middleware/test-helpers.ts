import type { Context } from "hono";
import { vi } from "vitest";

type CreateMockContextOptions = {
  headers?: Record<string, string>;
  variables?: Record<string, unknown>;
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

// One unavoidable cast: Hono's Context is too large to fully mock.
export const createMockContext = (
  opts: CreateMockContextOptions = {},
): { ctx: Context; mocks: MockContextMocks } => {
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

  const variables = new Map<string, unknown>([
    ["log", evlogLogger],
    ...Object.entries(opts.variables ?? {}),
  ]);

  const mocks: MockContextMocks = {
    get: vi.fn((key: string) => variables.get(key)),
    header: vi.fn(),
    json: vi.fn((body: unknown, status?: number) => ({ body, status })),
    loggerError,
    loggerInfo,
    loggerSet,
    loggerWarn,
    reqHeader: vi.fn((name: string) => opts.headers?.[name]),
    set: vi.fn((key: string, value: unknown) => {
      variables.set(key, value);
    }),
  };

  const ctx = {
    get: mocks.get,
    header: mocks.header,
    json: mocks.json,
    req: {
      header: mocks.reqHeader,
      method: "GET",
      path: "/test",
      url: "http://localhost/test",
    },
    set: mocks.set,
    var: { log: evlogLogger },
  } as unknown as Context;

  return { ctx, mocks };
};
