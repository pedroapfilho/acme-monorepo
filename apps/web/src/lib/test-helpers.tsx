import { render } from "@testing-library/react";
import {
  AppRouterContext,
  type AppRouterInstance,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { ReactNode } from "react";
import { onTestFinished, vi } from "vitest";

type AuthRequest = { body: unknown; path: string };

type AuthResponseBody = {
  code?: string;
  message?: string;
  status?: boolean;
  token?: string | null;
  user?: { id: string };
};

const respondToAuthRequests = (status: number, response: AuthResponseBody) => {
  const requests: Array<AuthRequest> = [];
  vi.mocked(fetch).mockImplementation((input, init) => {
    const body: unknown = typeof init?.body === "string" ? JSON.parse(init.body) : null;
    const url = input instanceof Request ? input.url : input;
    requests.push({ body, path: new URL(url).pathname });
    return Promise.resolve(Response.json(response, { status }));
  });
  onTestFinished(() => {
    vi.mocked(fetch).mockReset();
  });
  return requests;
};

const renderWithRouter = (ui: ReactNode) => {
  const router = {
    back: vi.fn<() => void>(),
    bfcacheId: "test",
    forward: vi.fn<() => void>(),
    prefetch: vi.fn<(href: string) => void>(),
    push: vi.fn<(href: string) => void>(),
    refresh: vi.fn<() => void>(),
    replace: vi.fn<(href: string) => void>(),
  } satisfies AppRouterInstance;
  render(<AppRouterContext value={router}>{ui}</AppRouterContext>);
  return router;
};

export { renderWithRouter, respondToAuthRequests };
