import type { Prisma } from "@repo/db";

import { AppError } from "@/lib/api-error";

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

type UserRepository = {
  delete: (input: { where: { id: string } }) => Promise<void>;
  findUnique: (input: { select: typeof userSelect; where: { id: string } }) => Promise<User | null>;
  update: (input: {
    data: UpdateUserInput;
    select: typeof userSelect;
    where: { id: string };
  }) => Promise<User>;
};

const createUserService = (users: UserRepository) => {
  const findUserById = async (id: string) => {
    const user = await users.findUnique({
      select: userSelect,
      where: { id },
    });

    if (!user) {
      throw new AppError("User not found", "USER_NOT_FOUND", 404);
    }

    return user;
  };

  const updateUser = async (id: string, data: UpdateUserInput) => {
    try {
      return await users.update({
        data,
        select: userSelect,
        where: { id },
      });
    } catch (error) {
      if (
        typeof data.username === "string" &&
        error instanceof Error &&
        "code" in error &&
        error.code === "P2002"
      ) {
        throw new AppError("Username already taken", "USERNAME_TAKEN", 409);
      }
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    await users.delete({ where: { id } });
    return { success: true };
  };

  return { deleteUser, findUserById, updateUser };
};

export { createUserService };
export type { UpdateUserInput, UserRepository };
