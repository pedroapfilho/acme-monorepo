import { expect, test } from "@playwright/test";
import { prisma } from "@repo/db";

import { webUrl } from "../../../playwright.config";
import { verification } from "../fixtures/verification.fixture";
import { extractLink, waitForEmail } from "../helpers/resend";
import { makeTestEmail, makeTestUsername } from "../helpers/test-email";

test.skip(!process.env.RESEND_API_KEY, "needs RESEND_API_KEY (test mode)");

// auth-email specs seed their own users and bypass the storageState the rest
// of the suite relies on — they need a clean cookie jar so the signup POST
// isn't rejected as "already signed in".
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Change email (two-stage confirmation + verification)", () => {
  test("user changes email — both stage-1 and stage-2 mails leave Resend, new email signs in", async ({
    page,
    request,
  }, testInfo) => {
    await page.context().clearCookies();

    const currentEmail = makeTestEmail(testInfo).toLowerCase();
    const newEmail = makeTestEmail(testInfo).toLowerCase().replace("delivered+", "delivered+new-");
    const username = makeTestUsername(currentEmail);
    const password = "ChangeEmailPwd1!";

    // Seed + verify a user, then sign in to get a session. Welcome email isn't
    // under test here; reuse the JWT-reconstruction path.
    const signUp = await request.post(`${webUrl}/api/auth/sign-up/email`, {
      data: { email: currentEmail, name: "Change Me", password, username },
    });
    expect([200, 201]).toContain(signUp.status());
    const verify = await verification.forVerifyEmail(currentEmail);
    await page.goto(verify.url);
    // forVerifyEmail builds a callbackURL=/verify-email/success URL, and the
    // verify-email handler runs with autoSignInAfterVerification: false — so
    // the click lands on /verify-email/success without setting a session
    // cookie. Sign in explicitly to attach the session for the change-email
    // request below.
    await page.waitForURL(/\/verify-email\/success$/v);
    const signIn = await request.post(`${webUrl}/api/auth/sign-in/email`, {
      data: { email: currentEmail, password },
    });
    expect(signIn.status()).toBe(200);

    // Parse Set-Cookie from the sign-in response and forward as Cookie on the
    // change-email call. Playwright's APIRequestContext storage state doesn't
    // include cookies set via API responses, so we have to thread the cookie
    // through manually. Better Auth issues a single `__Secure-<prefix>.
    // session_token` cookie marked HttpOnly/Secure/SameSite=Lax.
    const setCookie = signIn.headers()["set-cookie"] ?? "";
    const cookieHeader = setCookie
      .split(/,(?=\s*[\w-]+=)/u)
      .map((c) => c.split(";")[0].trim())
      .filter(Boolean)
      .join("; ");

    // Also seed the session cookie into the browser context so the later
    // page.goto(stage1Url/stage2Url) calls have an authenticated session
    // and the proxy doesn't bounce them to /login.
    const webHost = new URL(webUrl).hostname;
    const parsedCookies = setCookie
      .split(/,(?=\s*[\w-]+=)/u)
      .map((c) => {
        const [nameValue] = c.split(";");
        const eq = nameValue.indexOf("=");
        return { name: nameValue.slice(0, eq).trim(), value: nameValue.slice(eq + 1).trim() };
      })
      .filter((c) => c.name);
    const browserCookies = [];
    for (const c of parsedCookies) {
      browserCookies.push({
        domain: webHost,
        httpOnly: true,
        name: c.name,
        path: "/",
        sameSite: "Lax" as const,
        secure: true,
        value: c.value,
      });
    }
    await page.context().addCookies(browserCookies);

    const since = Date.now();

    const change = await request.post(`${webUrl}/api/auth/change-email`, {
      data: { newEmail },
      headers: {
        Cookie: cookieHeader,
        Origin: webUrl,
        Referer: `${webUrl}/`,
      },
    });
    expect(change.status()).toBe(200);

    // Stage 1 — current-mailbox owner consents. Assert the confirmation
    // email landed in Resend's outbox before following it.
    const stage1Mail = await waitForEmail({
      sinceMs: since,
      subject: /confirm|change/i,
      to: currentEmail,
    });
    expect(stage1Mail.last_event).not.toBe("bounced");
    const stage1Url = extractLink(stage1Mail, /\/api\/auth\/verify-email\?token=/v);

    // Stage-1 click — Better Auth's verify-email handler issues stage-2
    // internally (sent to newEmail) and redirects to callbackURL.
    await page.goto(stage1Url);
    await page.waitForURL("/dashboard");

    // Stage 2 — assert the verification mail to the NEW address actually sent.
    const stage2Mail = await waitForEmail({
      sinceMs: since,
      to: newEmail,
    });
    expect(stage2Mail.last_event).not.toBe("bounced");
    const stage2Url = extractLink(stage2Mail, /\/api\/auth\/verify-email\?token=/v);

    // Stage-2 click — proves new-mailbox access. This is the call that
    // actually updates the user record.
    await page.goto(stage2Url);
    await page.waitForURL("/dashboard");

    // DB now reflects the new email. The user row count is unchanged.
    const updated = await prisma.user.findUnique({ where: { email: newEmail } });
    expect(updated).not.toBeNull();
    const stale = await prisma.user.findUnique({ where: { email: currentEmail } });
    expect(stale).toBeNull();

    // Old email no longer authenticates.
    await page.context().clearCookies();
    const oldLogin = await request.post(`${webUrl}/api/auth/sign-in/email`, {
      data: { email: currentEmail, password },
    });
    expect(oldLogin.status()).toBeGreaterThanOrEqual(400);

    // New email does.
    await page.goto("/login");
    await page.getByLabel("Email").fill(newEmail);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});
