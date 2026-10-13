import { test, expect } from "../fixtures/auth.fixture";
import { TEST_USER } from "../fixtures/test-user";

test.describe("Password Recovery", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("submits recovery form and shows inline success state", async ({ page, recoverPage }) => {
    await recoverPage.goto();
    await recoverPage.requestReset(TEST_USER.email);

    await recoverPage.expectResetRequested(TEST_USER.email);
    expect(page.url()).toContain("/recover");
  });

  test("shows validation error for invalid email", async ({ page, recoverPage }) => {
    await recoverPage.goto();
    await recoverPage.requestReset("not-an-email");

    await recoverPage.expectEmailError(/valid email/iv);
    expect(page.url()).toContain("/recover");
  });
});
