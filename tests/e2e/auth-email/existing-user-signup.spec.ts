import { prisma } from "@repo/db";
import { expect, test } from "@playwright/test";

import { webUrl } from "../../../playwright.config";
import { makeTestEmail, makeTestUsername } from "../helpers/test-email";

test.skip(!process.env.RESEND_API_KEY, "needs RESEND_API_KEY (test mode)");

test.describe("Sign-up for an existing email (enumeration prevention)", () => {
  test("second signup returns synthetic success without creating a duplicate", async ({
    page,
    request,
  }, testInfo) => {
    await page.context().clearCookies();

    const email = makeTestEmail(testInfo).toLowerCase();
    const username = makeTestUsername(email);

    const first = await request.post(`${webUrl}/api/auth/sign-up/email`, {
      data: { email, name: "Original Name", password: "FirstPassword1!", username },
    });
    expect([200, 201]).toContain(first.status());

    // Second sign-up with same email — Better Auth's enumeration-prevention
    // returns the same shape as a fresh signup; onExistingUserSignUp fires
    // server-side. The test verifies the *contract* (no error, same status
    // class) and the *side-effect ceiling* (no duplicate row).
    const second = await request.post(`${webUrl}/api/auth/sign-up/email`, {
      data: { email, name: "Different Name", password: "SecondPassword2!", username: `${username}_2` },
    });
    expect([200, 201]).toContain(second.status());

    // Exactly one user with that email. Better Auth's email field is unique
    // at the schema level too, but asserting here pins behavior: the synthetic
    // success path must NEVER write a second row, even by mistake.
    const users = await prisma.user.findMany({ where: { email } });
    expect(users).toHaveLength(1);
    expect(users[0]?.name).toBe("Original Name");
  });
});
