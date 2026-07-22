import { OpenAPIHono } from "@hono/zod-openapi";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { NODE_ENV: "test" },
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock("@/lib/users", () => ({
  deleteUser: vi.fn(),
  findUserById: vi.fn(),
  updateUser: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { deleteUser, findUserById, updateUser } from "@/lib/users";
import { errorHandler } from "@/middleware/error-handler";

import { v1UserRoutes } from "./users";

const mockUser = {
  createdAt: new Date("2024-01-01"),
  displayName: "Test User",
  email: "test@example.com",
  emailVerified: true,
  id: "user-1",
  name: "Test",
  updatedAt: new Date("2024-01-01"),
  username: "testuser",
};

const serializedUser = {
  ...mockUser,
  createdAt: mockUser.createdAt.toISOString(),
  updatedAt: mockUser.updatedAt.toISOString(),
};

const mockSession = (user: { email: string; id: string } | null) =>
  vi.mocked(auth.api.getSession).mockResolvedValue((user ? { session: {}, user } : null) as never);

const buildApp = () => {
  const app = new OpenAPIHono();
  app.use("*", (c, next) => {
    c.set("log", { error: () => {}, info: () => {} } as never);
    return next();
  });
  app.route("/api/v1/users", v1UserRoutes);
  app.onError(errorHandler);
  return app;
};

describe("v1 user routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /me", () => {
    it("returns the serialized user with ISO date strings", async () => {
      mockSession({ email: "test@example.com", id: "user-1" });
      vi.mocked(findUserById).mockResolvedValue(mockUser);

      const res = await v1UserRoutes.request("/me", { headers: { Cookie: "session=x" } });

      expect(res.status).toBe(200);
      const body = (await res.json()) as { data: typeof serializedUser };
      expect(body).toEqual({ data: serializedUser });
      expect(body.data.createdAt).toBe("2024-01-01T00:00:00.000Z");
      expect(body.data.updatedAt).toBe("2024-01-01T00:00:00.000Z");
    });

    it("returns the nested 401 error shape when unauthenticated", async () => {
      mockSession(null);

      const app = buildApp();
      const res = await app.request("/api/v1/users/me");

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({
        error: { code: "HTTP_EXCEPTION", message: "Authentication required" },
      });
    });
  });

  describe("PATCH /me", () => {
    it("returns the updated serialized user", async () => {
      mockSession({ email: "test@example.com", id: "user-1" });
      vi.mocked(updateUser).mockResolvedValue({ ...mockUser, name: "New Name" });

      const res = await v1UserRoutes.request("/me", {
        body: JSON.stringify({ name: "New Name" }),
        headers: { "Content-Type": "application/json", Cookie: "session=x" },
        method: "PATCH",
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as { data: { createdAt: string; name: string } };
      expect(body.data.name).toBe("New Name");
      expect(body.data.createdAt).toBe("2024-01-01T00:00:00.000Z");
    });
  });

  describe("DELETE /me", () => {
    it("returns 204 with no body", async () => {
      mockSession({ email: "test@example.com", id: "user-1" });
      vi.mocked(deleteUser).mockResolvedValue({ success: true });

      const res = await v1UserRoutes.request("/me", {
        headers: { Cookie: "session=x" },
        method: "DELETE",
      });

      expect(res.status).toBe(204);
      expect(await res.text()).toBe("");
    });
  });

  describe("GET /", () => {
    it("returns the list envelope with data and meta", async () => {
      mockSession({ email: "test@example.com", id: "user-1" });
      vi.mocked(findUserById).mockResolvedValue(mockUser);

      const res = await v1UserRoutes.request("/", { headers: { Cookie: "session=x" } });

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({
        data: [serializedUser],
        meta: { page: 1, total: 1, totalPages: 1 },
      });
    });
  });
});
