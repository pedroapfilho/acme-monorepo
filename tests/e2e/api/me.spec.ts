import { test, expect } from "../fixtures/auth.fixture";
import { apiUrl } from "../urls";

test.describe("API session", () => {
  test("GET /api/v1/me returns the signed-in user", async ({ account, api }) => {
    const response = await api.get("/api/v1/me");

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ data: { email: account.email, id: account.id } });
  });

  test("GET /api/v1/me rejects a request without a session", async ({ request }) => {
    const response = await request.get(`${apiUrl}/api/v1/me`, { headers: { Cookie: "" } });

    expect(response.status()).toBe(401);
  });
});
