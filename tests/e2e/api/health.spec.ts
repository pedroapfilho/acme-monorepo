import { expect, test } from "@playwright/test";

import { apiUrl } from "../../../playwright.config";

// Health checks don't need auth — use base test, not fixture
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("API Health Checks", () => {
  test("GET /healthz returns healthy", async ({ request }) => {
    const response = await request.get(`${apiUrl}/healthz`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("healthy");
    expect(body.service).toBe("api");
    expect(body.timestamp).toBeTruthy();
  });

  test("GET /readyz returns ready when database is connected", async ({ request }) => {
    const response = await request.get(`${apiUrl}/readyz`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("ready");
    expect(body.checks.database).toBe("healthy");
  });
});
