import { prisma } from "@repo/db";
import type { Prisma } from "@repo/db";

import { AppError } from "@/middleware/error-handler";

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

export const findUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    select: userSelect,
    where: { id },
  });

  if (!user) {
    throw new AppError("User not found", 404, true, "USER_NOT_FOUND");
  }

  return user;
};

export const findUserByEmail = (email: string) =>
  prisma.user.findUnique({
    select: userSelect,
    where: { email },
  });

export const updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
  if (typeof data.username === "string") {
    const existing = await prisma.user.findFirst({
      where: {
        NOT: { id },
        username: data.username,
      },
    });

    if (existing) {
      throw new AppError("Username already taken", 400, true, "USERNAME_TAKEN");
    }
  }

  return prisma.user.update({
    data,
    select: userSelect,
    where: { id },
  });
};

export const deleteUser = async (id: string) => {
  await prisma.user.delete({
    where: { id },
  });

  return { success: true };
};
