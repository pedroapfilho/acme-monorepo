import { z } from "@hono/zod-openapi";
import type { Auth } from "@repo/auth/server";
import type { Prisma, PrismaClient } from "@repo/db";

const userSchema = z
  .object({
    createdAt: z.iso.datetime(),
    displayName: z.string().nullable(),
    email: z.email(),
    emailVerified: z.boolean(),
    id: z.string(),
    name: z.string().nullable(),
    updatedAt: z.iso.datetime(),
    username: z.string().nullable(),
  })
  .openapi("User");

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

const serializeUser = (user: User): z.input<typeof userSchema> => ({
  ...user,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

type UpdateUserInput = {
  name?: string;
  username?: string;
};

type UserStore = {
  delete: (request: { headers: Headers; password?: string }) => Promise<Headers>;
  find: (id: string) => Promise<User | null>;
  update: (request: { data: UpdateUserInput; headers: Headers }) => Promise<Headers>;
};

const createUserStore = (auth: Auth, prisma: PrismaClient): UserStore => ({
  delete: async ({ headers, password }) => {
    const result = await auth.api.deleteUser({ body: { password }, headers, returnHeaders: true });

    return result.headers;
  },
  find: (id) => prisma.user.findUnique({ select: userSelect, where: { id } }),
  update: async ({ data, headers }) => {
    const result = await auth.api.updateUser({
      body: { ...data, displayUsername: data.username },
      headers,
      returnHeaders: true,
    });

    return result.headers;
  },
});

export { createUserStore, serializeUser, userSchema };

export type { User, UserStore };
