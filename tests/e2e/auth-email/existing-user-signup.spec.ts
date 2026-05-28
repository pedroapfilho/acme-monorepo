import { expect, test } from "@playwright/test";
import { prisma } from "@repo/db";

import { webUrl } from "../../../playwright.config";
import { waitForEmail } from "../helpers/resend";
import { makeTestEmail, makeTestUsername } from "../helpers/test-email";

test.skip(!process.env.RESEND_API_KEY, "needs RESEND_API_KEY (test mode)");

test.describe("Sign-up for an existing email (enumeration prevention)", () => {
  test("second signup returns synthetic success, notifies the real account holder, no duplicate row", async ({
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

    // Pin AFTER the first signup so the welcome mail doesn't match the
    // sign-up-attempt assertion below.
    const since = Date.now();

    // Second sign-up with same email — Better Auth's enumeration-prevention
    // returns the same shape as a fresh signup; `onExistingUserSignUp` fires
    // server-side and dispatches a "someone tried to sign up" notification
    // to the real account holder.
    const second = await request.post(`${webUrl}/api/auth/sign-up/email`, {
      data: {
        email,
        name: "Different Name",
        password: "SecondPassword2!",
        username: `${username}_2`,
      },
    });
    expect([200, 201]).toContain(second.status());

    // Side-effect ceiling: exactly one user row.
    const users = await prisma.user.findMany({ where: { email } });
    expect(users).toHaveLength(1);
    expect(users[0]?.name).toBe("Original Name");

    // Side-effect floor: the notification email actually went out via Resend.
    // Without this assertion, a regression that disabled the hook would pass
    // the test silently — exactly the bug class we're trying to catch.
    const mail = await waitForEmail({
      sinceMs: since,
      subject: /sign[\s-]?up|attempt|tried/i,
      to: email,
    });
    expect(mail.last_event).not.toBe("bounced");
  });
});
