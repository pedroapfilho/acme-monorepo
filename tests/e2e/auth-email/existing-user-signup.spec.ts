import { expect, test } from "@playwright/test";
import { db, user } from "@repo/db";
import { eq } from "drizzle-orm";

import { webUrl } from "../../../playwright.config";
import { waitForEmail } from "../helpers/resend";
import { makeTestEmail, makeTestUsername } from "../helpers/test-email";

test.skip(!process.env.RESEND_API_KEY, "needs RESEND_API_KEY (test mode)");

test.use({ storageState: { cookies: [], origins: [] } });

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

    // Pin AFTER the first signup so its welcome mail doesn't match below.
    const since = Date.now();

    // Duplicate email → synthetic success; onExistingUserSignUp fires server-side.
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
    const users = await db.select().from(user).where(eq(user.email, email));
    expect(users).toHaveLength(1);
    expect(users[0]?.name).toBe("Original Name");

    // Side-effect floor: the notification email actually went out via Resend.
    const mail = await waitForEmail({
      sinceMs: since,
      subject: /sign[\s-]?up|attempt|tried/i,
      to: email,
    });
    expect(mail.last_event).not.toBe("bounced");
  });
});
