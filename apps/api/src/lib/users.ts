import { prisma } from "@repo/db";
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

export const findUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    select: userSelect,
    where: { id },
  });

  if (!user) {
    throw new AppError("User not found", "USER_NOT_FOUND", 404);
  }

  return user;
};

export const updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
  try {
    return await prisma.user.update({
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

export const deleteUser = async (id: string) => {
  await prisma.user.delete({
    where: { id },
  });

  return { success: true };
};
