import type { Auth } from "@repo/auth/server";
import type { Prisma, PrismaClient } from "@repo/db";

const userSelect = {
  createdAt: true,
  displayName: true,
  email: true,
  emailVerified: true,
  id: true,
  name: true,
  updatedAt: true,
  username: true,
} satisfies Prisma.UserSelect;

type User = Prisma.UserGetPayload<{ select: typeof userSelect }>;

type UpdateUserInput = {
  name?: string;
  username?: string;
};

type UserStore = {
  delete: (request: { headers: Headers; password?: string }) => Promise<void>;
  find: (id: string) => Promise<User | null>;
  update: (request: { data: UpdateUserInput; headers: Headers }) => Promise<void>;
};

// Writes go through Better Auth so its username plugin validates, normalizes, and sets displayUsername.
const createUserStore = (auth: Auth, prisma: PrismaClient): UserStore => ({
  delete: async ({ headers, password }) => {
    await auth.api.deleteUser({ body: { password }, headers });
  },
  find: (id) => prisma.user.findUnique({ select: userSelect, where: { id } }),
  update: async ({ data, headers }) => {
    await auth.api.updateUser({ body: { ...data, displayUsername: data.username }, headers });
  },
});

export { createUserStore };
export type { User, UserStore };
