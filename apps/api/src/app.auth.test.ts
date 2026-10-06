import { createAuth } from "@repo/auth/server";
import { prisma } from "@repo/db";
import { initApiLogger } from "@repo/observability/hono";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { getCookies } from "better-auth/cookies";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { createApp } from "./app";
import { createUserStore } from "./lib/users";
import type { User } from "./lib/users";

const authOptions = createAuth({
  allowedHosts: ["localhost:*"],
  fromEmail: "noreply@acme.com",
  prisma,
  secret: "test-secret-minimum-32-characters-long",
}).options;

type StoredUser = User & { displayUsername: string | null };
type StoredSession = { createdAt: Date; userId: string };

const cookieHeader = (headers: Headers) =>
  headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");

const fixture = async () => {
  const records: { session: Array<StoredSession>; user: Array<StoredUser> } = {
    session: [],
    user: [],
  };
  const auth = betterAuth({
    ...authOptions,
    database: memoryAdapter(records),
  });
  const signedUp = await auth.api.signUpEmail({
    body: {
      email: "test@example.com",
      name: "Test",
      password: "test-password-123",
      username: "testuser",
    },
    returnHeaders: true,
  });
  const headers = { "Content-Type": "application/json", Cookie: cookieHeader(signedUp.headers) };
  const app = createApp({
    checkDatabase: () => Promise.resolve(),
    corsOrigins: [],
    getSession: auth.api.getSession,
    isProduction: true,
    sessionCookieName: getCookies(auth.options).sessionToken.name,
    trustProxy: false,
    users: {
      ...createUserStore(auth, prisma),
      find: (id) => {
        const user = records.user.find((record) => record.id === id);
        return Promise.resolve(
          user
            ? {
                createdAt: user.createdAt,
                displayName: user.displayName,
                email: user.email,
                emailVerified: user.emailVerified,
                id: user.id,
                name: user.name,
                updatedAt: user.updatedAt,
                username: user.username,
              }
            : null,
        );
      },
    },
  });
  const request = (init: RequestInit) =>
    app.request("/api/v1/users/me", init, {
      incoming: { socket: { remoteAddress: "203.0.113.10" } },
    });
  return { auth, headers, records, request };
};

beforeAll(() => {
  vi.stubEnv("NODE_ENV", "production");
  initApiLogger({ service: "api" });
  vi.unstubAllEnvs();
  vi.spyOn(console, "info").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("Better Auth account writes through createApp", () => {
  it("normalizes usernames, preserves displayUsername and refreshes the cookie cache", async () => {
    const { auth, headers, records, request } = await fixture();
    const response = await request({
      body: JSON.stringify({ username: "New.Name" }),
      headers,
      method: "PATCH",
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ data: { username: "new.name" } });
    expect(records.user[0]).toMatchObject({ displayUsername: "New.Name", username: "new.name" });
    expect(response.headers.getSetCookie()).toEqual(
      expect.arrayContaining([
        expect.stringContaining("acme.session_token="),
        expect.stringContaining("acme.session_data="),
      ]),
    );
    const session = await auth.api.getSession({
      headers: new Headers({ Cookie: cookieHeader(response.headers) }),
    });
    expect(session?.user).toMatchObject({ displayUsername: "New.Name", username: "new.name" });
  });

  it.each(["has-hyphen", "ab", "a".repeat(31)])(
    "rejects invalid username %s without changing the user",
    async (username) => {
      const { headers, records, request } = await fixture();
      const response = await request({
        body: JSON.stringify({ username }),
        headers,
        method: "PATCH",
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: { code: expect.any(String), message: expect.any(String) },
      });
      expect(records.user[0]?.username).toBe("testuser");
    },
  );

  it("preserves Better Auth's 400 status for username conflicts", async () => {
    const { auth, headers, records, request } = await fixture();
    await auth.api.signUpEmail({
      body: {
        email: "taken@example.com",
        name: "Taken",
        password: "test-password-123",
        username: "taken",
      },
    });
    const response = await request({
      body: JSON.stringify({ username: "TaKeN" }),
      headers,
      method: "PATCH",
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: "USERNAME_IS_ALREADY_TAKEN" } });
    expect(records.user[0]?.username).toBe("testuser");
  });

  it("requires a fresh authoritative session before deletion, even with a fresh cookie cache", async () => {
    const { headers, records, request } = await fixture();
    const session = records.session[0];
    if (!session) {
      throw new Error("Sign-up did not create a session");
    }
    session.createdAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const response = await request({ headers: { Cookie: headers.Cookie }, method: "DELETE" });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: "SESSION_EXPIRED" } });
    expect(records.user).toHaveLength(1);
    expect(records.session).toHaveLength(1);
  });

  it("deletes the user, revokes sessions and expires their cookies", async () => {
    const { headers, records, request } = await fixture();
    const response = await request({ headers: { Cookie: headers.Cookie }, method: "DELETE" });

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expect(records.user).toHaveLength(0);
    expect(records.session).toHaveLength(0);
    expect(response.headers.getSetCookie()).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/acme\.session_token=;.*Max-Age=0/),
        expect.stringMatching(/acme\.session_data=;.*Max-Age=0/),
      ]),
    );
  });
});
