import { prisma } from "@repo/db";
import type { Prisma } from "@repo/db";

import { logger } from "@/lib/logger";
import { AppError, isPrismaKnownError } from "@/middleware/error-handler";

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
  try {
    const user = await prisma.user.findUnique({
      select: userSelect,
      where: { id },
    });

    if (!user) {
      throw new AppError("User not found", 404, true, "USER_NOT_FOUND");
    }

    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logger.error({ error, userId: id }, "Failed to find user by ID");
    throw new AppError("Failed to fetch user", 500, false, "USER_FETCH_ERROR");
  }
};

export const findUserByEmail = async (email: string) => {
  try {
    return await prisma.user.findUnique({
      select: userSelect,
      where: { email },
    });
  } catch (error) {
    logger.error({ email, error }, "Failed to find user by email");
    throw new AppError("Failed to fetch user", 500, false, "USER_FETCH_ERROR");
  }
};

export const updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
  try {
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

    const updatedUser = await prisma.user.update({
      data,
      select: userSelect,
      where: { id },
    });

    logger.info({ fields: Object.keys(data), userId: id }, "User updated successfully");

    return updatedUser;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (isPrismaKnownError(error) && error.code === "P2025") {
      throw new AppError("User not found", 404, true, "USER_NOT_FOUND");
    }

    logger.error({ error, userId: id }, "Failed to update user");
    throw new AppError("Failed to update user", 500, false, "USER_UPDATE_ERROR");
  }
};

export const deleteUser = async (id: string) => {
  try {
    await prisma.user.delete({
      where: { id },
    });

    logger.info({ userId: id }, "User deleted successfully");

    return { success: true };
  } catch (error) {
    if (isPrismaKnownError(error) && error.code === "P2025") {
      throw new AppError("User not found", 404, true, "USER_NOT_FOUND");
    }

    logger.error({ error, userId: id }, "Failed to delete user");
    throw new AppError("Failed to delete user", 500, false, "USER_DELETE_ERROR");
  }
};
