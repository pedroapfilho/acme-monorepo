import { expect, test } from "@playwright/test";
import { prisma } from "@repo/db";

import { webUrl } from "../../../playwright.config";
import { verification } from "../fixtures/verification.fixture";
import { extractLink, waitForEmail } from "../helpers/resend";
import { makeTestEmail, makeTestUsername } from "../helpers/test-email";

test.skip(!process.env.RESEND_API_KEY, "needs RESEND_API_KEY (test mode)");

// Shared storageState would make the signup POST 400 as "already signed in".
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

    // Welcome email isn't under test — use JWT reconstruction.
    const signUp = await request.post(`${webUrl}/api/auth/sign-up/email`, {
      data: { email: currentEmail, name: "Change Me", password, username },
    });
    expect([200, 201]).toContain(signUp.status());
    const verify = await verification.forVerifyEmail(currentEmail);
    await page.goto(verify.url);
    // autoSignInAfterVerification signs in the page; API sign-in threads cookies for change-email.
    await page.waitForURL(/\/dashboard$/v);
    const signIn = await request.post(`${webUrl}/api/auth/sign-in/email`, {
      data: { email: currentEmail, password },
    });
    expect(signIn.status()).toBe(200);

    // Playwright's APIRequestContext doesn't persist API-set cookies, so thread Set-Cookie manually.
    const setCookie = signIn.headers()["set-cookie"] ?? "";
    const cookieHeader = setCookie
      .split(/,(?=\s*[\w-]+=)/u)
      .map((c) => c.split(";")[0].trim())
      .filter(Boolean)
      .join("; ");

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

    const stage1Mail = await waitForEmail({
      sinceMs: since,
      subject: /confirm|change/i,
      to: currentEmail,
    });
    expect(stage1Mail.last_event).not.toBe("bounced");
    const stage1Url = extractLink(stage1Mail, /\/api\/auth\/verify-email\?token=/v);

    await page.goto(stage1Url);
    await page.waitForURL("/dashboard");

    const stage2Mail = await waitForEmail({
      sinceMs: since,
      to: newEmail,
    });
    expect(stage2Mail.last_event).not.toBe("bounced");
    const stage2Url = extractLink(stage2Mail, /\/api\/auth\/verify-email\?token=/v);

    await page.goto(stage2Url);
    await page.waitForURL("/dashboard");

    const updated = await prisma.user.findUnique({ where: { email: newEmail } });
    expect(updated).not.toBeNull();
    const stale = await prisma.user.findUnique({ where: { email: currentEmail } });
    expect(stale).toBeNull();

    await page.context().clearCookies();
    const oldLogin = await request.post(`${webUrl}/api/auth/sign-in/email`, {
      data: { email: currentEmail, password },
    });
    expect(oldLogin.status()).toBeGreaterThanOrEqual(400);

    await page.goto("/login");
    await page.getByLabel("Email").fill(newEmail);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});
