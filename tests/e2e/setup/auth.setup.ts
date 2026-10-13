import { expect, test as setup } from "@playwright/test";

import { signIn } from "../fixtures/session";
import { TEST_USER, TEST_USER_STATE } from "../fixtures/test-user";

setup("sign in the seeded test user", async ({ request }) => {
  await expect(await signIn(request, TEST_USER)).toBeOK();
  await request.storageState({ path: TEST_USER_STATE });
});
