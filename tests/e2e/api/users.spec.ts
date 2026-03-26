import { apiUrl } from "../../../playwright.config";
import { test, expect } from "../fixtures/auth.fixture";

test.describe("API Users", () => {
  test("GET /api/v1/users/me returns authenticated user", async ({ request }) => {
    const response = await request.get(`${apiUrl}/api/v1/users/me`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data.email).toBe("e2e-test@acme.localhost");
    expect(body.data.name).toBe("E2E Test User");
    expect(body.data.id).toBeTruthy();
  });

  test("PATCH /api/v1/users/me updates user name", async ({ request }) => {
    const response = await request.patch(`${apiUrl}/api/v1/users/me`, {
      data: { name: "Updated Name" },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data.name).toBe("Updated Name");

    // Restore original name
    await request.patch(`${apiUrl}/api/v1/users/me`, {
      data: { name: "E2E Test User" },
    });
  });

  test("PATCH /api/v1/users/me validates username format", async ({ request }) => {
    const response = await request.patch(`${apiUrl}/api/v1/users/me`, {
      data: { username: "invalid username!" },
    });

    expect(response.status()).toBe(400);
  });

  test("GET /api/v1/users lists users with pagination", async ({ request }) => {
    const response = await request.get(`${apiUrl}/api/v1/users?limit=5&page=1`);

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

    // The request context has storageState cookies; override with empty headers
    expect(unauthResponse.status()).toBe(401);
  });
});
