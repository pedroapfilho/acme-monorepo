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

type AuthServer = { respond: ((request: AuthRequest) => Response) | null };

const authServer: AuthServer = { respond: null };

// Better Auth captures `fetch` when the client is created, so this module must load before `@/lib/auth-client`.
vi.stubGlobal("fetch", (input: URL | string, init: RequestInit) => {
  const body: unknown = typeof init.body === "string" ? JSON.parse(init.body) : null;
  const request = { body, path: new URL(input).pathname };
  if (authServer.respond === null) {
    throw new Error(`Unexpected auth request to ${request.path}`);
  }
  return Promise.resolve(authServer.respond(request));
});

/** Answers every Better Auth request with one JSON response and records what was sent. */
const respondToAuthRequests = (status: number, response: AuthResponseBody) => {
  const requests: Array<AuthRequest> = [];
  authServer.respond = (request) => {
    requests.push(request);
    return Response.json(response, { status });
  };
  onTestFinished(() => {
    authServer.respond = null;
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
