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
  try {
    return await prisma.user.update({
      data,
      select: userSelect,
      where: { id },
    });
  } catch (error) {
    // Only a username change can raise a username-uniqueness violation. Guarding
    // on data.username keeps an unrelated P2002 (email, displayUsername) flowing
    // to the central handler as a generic 409 instead of a misleading
    // USERNAME_TAKEN.
    if (
      typeof data.username === "string" &&
      error instanceof Error &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new AppError("Username already taken", 409, true, "USERNAME_TAKEN");
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
