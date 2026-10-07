import { test, expect } from "../fixtures/auth.fixture";
import { TEST_USER } from "../fixtures/test-user";
import { apiUrl } from "../urls";

test.describe("API Users", () => {
  // The PATCH tests rename the shared seeded user and restore it.
  test.describe.configure({ mode: "default" });

  test("GET /api/v1/users/me returns authenticated user", async ({ api }) => {
    const response = await api.get("/api/v1/users/me");

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data.email).toBe(TEST_USER.email);
    expect(body.data.name).toBe(TEST_USER.name);
    expect(body.data.id).toBeTruthy();
  });

  test("PATCH /api/v1/users/me updates user name", async ({ api }) => {
    const response = await api.patch("/api/v1/users/me", {
      data: { name: "Updated Name" },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data.name).toBe("Updated Name");

    await api.patch("/api/v1/users/me", {
      data: { name: TEST_USER.name },
    });
  });

  test("PATCH /api/v1/users/me validates username format", async ({ api }) => {
    const response = await api.patch("/api/v1/users/me", {
      data: { username: "invalid username!" },
    });

    expect(response.status()).toBe(400);
  });

  test("GET /api/v1/users lists users with pagination", async ({ api }) => {
    const response = await api.get("/api/v1/users?limit=5&page=1");

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data).toBeInstanceOf(Array);
    expect(body.meta.page).toBe(1);
    expect(body.meta.total).toBeGreaterThanOrEqual(1);
    expect(body.meta.totalPages).toBeGreaterThanOrEqual(1);
  });

  test("GET /api/v1/users/me rejects unauthenticated request", async ({ request }) => {
    const unauthResponse = await request.get(`${apiUrl}/api/v1/users/me`, {
      headers: { Cookie: "" },
    });

    expect(unauthResponse.status()).toBe(401);
  });
});
