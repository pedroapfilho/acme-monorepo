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
  reqHeader: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
};

// One cast is unavoidable because Hono's Context surface is too large
// to fully mock; consolidating to one helper means test files stay cast-free.
export const createMockContext = (
  opts: CreateMockContextOptions = {},
): { ctx: Context; mocks: MockContextMocks } => {
  const variables = new Map<string, unknown>(Object.entries(opts.variables ?? {}));

  const mocks: MockContextMocks = {
    get: vi.fn((key: string) => variables.get(key)),
    header: vi.fn(),
    json: vi.fn((body: unknown, status?: number) => ({ body, status })),
    loggerError: vi.fn(),
    loggerInfo: vi.fn(),
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
    var: { logger: { error: mocks.loggerError, info: mocks.loggerInfo } },
  } as unknown as Context;

  return { ctx, mocks };
};
