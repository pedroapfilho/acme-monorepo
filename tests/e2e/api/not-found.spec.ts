import { expect, test } from "@playwright/test";

import { apiUrl } from "../../../playwright.config";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("API Not Found", () => {
  test("returns 404 for unknown routes", async ({ request }) => {
    const response = await request.get(`${apiUrl}/api/v1/nonexistent`);

    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.error.code).toBe("NOT_FOUND");
  });
});
