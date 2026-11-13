import { expect, test as setup } from "@playwright/test";

import { signIn, signUp } from "../fixtures/session";
import { TEST_USER, TEST_USER_STATE } from "../fixtures/test-user";
import { prisma } from "../helpers/database";

setup("sign in the seeded test user", async ({ request }) => {
  const existing = await signIn(request, TEST_USER);

  if (!existing.ok()) {
    await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
    await expect(await signUp(request, TEST_USER)).toBeOK();
    await prisma.user.update({ data: { emailVerified: true }, where: { email: TEST_USER.email } });
    await expect(await signIn(request, TEST_USER)).toBeOK();
  }

  await request.storageState({ path: TEST_USER_STATE });
});
