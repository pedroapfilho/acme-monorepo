import { expect, request } from "@playwright/test";

import { signOut } from "../fixtures/session";
import { TEST_USER_STATE } from "../fixtures/test-user";

const cleanup = async () => {
  const seededUser = await request.newContext({ storageState: TEST_USER_STATE });
  await expect(await signOut(seededUser)).toBeOK();
  await seededUser.dispose();
};

export default cleanup;
