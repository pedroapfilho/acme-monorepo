import { prisma } from "@repo/db";

import { expect, test } from "../fixtures/auth.fixture";
import { signUp } from "../fixtures/session";
import { waitForEmail } from "../helpers/resend";

test.describe("Sign-up for an existing email (enumeration prevention)", { tag: "@email" }, () => {
  test("second signup returns synthetic success, notifies the real account holder, no duplicate row", async ({
    createAccount,
    request,
  }) => {
    const credentials = await createAccount();

    const sinceMs = Date.now();
    await expect(
      await signUp(request, {
        ...credentials,
        name: "Different Name",
        password: "SecondPassword2!",
      }),
    ).toBeOK();

    const users = await prisma.user.findMany({ where: { email: credentials.email } });
    expect(users).toHaveLength(1);
    expect(users[0]?.name).toBe(credentials.name);

    const mail = await waitForEmail({
      sinceMs,
      subject: /sign[\s\-]?up|attempt|tried/iv,
      to: credentials.email,
    });
    expect(mail.last_event).not.toBe("bounced");
  });
});
