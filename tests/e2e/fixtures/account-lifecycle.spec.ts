import { prisma } from "@repo/db";

import { expect, test as sessionTest } from "./auth.fixture";
import { signOut, signUp } from "./session";
import { TEST_USER } from "./test-user";

const ownedUserIds = new Set<string>();

const test = sessionTest.extend({
  createAccount: async ({ createAccount }, use) => {
    await use(async (register) => {
      const account = await createAccount(register);
      ownedUserIds.add(account.id);

      return account;
    });
  },
});

test.afterAll(async () => {
  const ids = [...ownedUserIds];
  expect(await prisma.user.count({ where: { id: { in: ids } } })).toBe(0);
  expect(await prisma.account.count({ where: { userId: { in: ids } } })).toBe(0);
  expect(await prisma.session.count({ where: { userId: { in: ids } } })).toBe(0);
  expect(await prisma.user.findUnique({ where: { email: TEST_USER.email } })).toMatchObject({
    name: TEST_USER.name,
  });
});

test("cleans up after a failed assertion following mutation", async ({ account, api }) => {
  await expect(await api.patch("/api/v1/users/me", { data: { name: "Before failure" } })).toBeOK();
  test.fail();
  expect(account.name).toBe("deliberate assertion failure");
});

test("cleans up after signing out", async ({ account, request }) => {
  await expect(await signOut(request)).toBeOK();
  expect(await prisma.user.findUnique({ where: { id: account.id } })).not.toBeNull();
});

test("cleans up by ID after changing credentials", async ({ account }) => {
  await prisma.user.update({
    data: { email: account.email.replace("delivered+", "delivered+new-") },
    where: { id: account.id },
  });
  await prisma.account.updateMany({ data: { password: "changed" }, where: { userId: account.id } });
});

test("cleans up an unverified signup without a session", async ({
  createAccount,
  emailDelivery,
}) => {
  const account = await createAccount();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: account.id } });
  expect(user.emailVerified).toBe(false);
  expect(await prisma.session.count({ where: { userId: account.id } })).toBe(emailDelivery ? 0 : 1);
});

test("cleanup is idempotent and scoped to all allocated identities", async ({ createAccount }) => {
  const first = await createAccount();
  const second = await createAccount();
  await prisma.user.delete({ where: { id: first.id } });
  expect(await prisma.user.findUnique({ where: { id: second.id } })).not.toBeNull();
});

test("cleans up when registration assertions fail", async ({ context, createAccount }) => {
  await expect(
    createAccount(async (credentials) => {
      await expect(await signUp(context.request, credentials)).toBeOK();
      const user = await prisma.user.findUniqueOrThrow({ where: { email: credentials.email } });
      ownedUserIds.add(user.id);
      expect(user.name).toBe("deliberate registration assertion failure");
    }),
  ).rejects.toThrow("deliberate registration assertion failure");
});
