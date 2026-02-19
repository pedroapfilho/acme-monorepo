import { prisma } from "@repo/db";
import type { Prisma } from "@repo/db";

import { logger } from "@/lib/logger";
import { AppError } from "@/middleware/error-handler";

export class UserService {
  async findById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        select: {
          createdAt: true,
          displayName: true,
          email: true,
          emailVerified: true,
          id: true,
          name: true,
          updatedAt: true,
          username: true,
        },
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
  }

  async findByEmail(email: string) {
    try {
      const user = await prisma.user.findUnique({
        select: {
          createdAt: true,
          displayName: true,
          email: true,
          emailVerified: true,
          id: true,
          name: true,
          username: true,
        },
        where: { email },
      });

      return user;
    } catch (error) {
      logger.error({ email, error }, "Failed to find user by email");
      throw new AppError("Failed to fetch user", 500, false, "USER_FETCH_ERROR");
    }
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    try {
      // Validate username uniqueness if provided
      if (data.username) {
        const existing = await prisma.user.findFirst({
          where: {
            NOT: { id },
            username: data.username as string,
          },
        });

        if (existing) {
          throw new AppError("Username already taken", 400, true, "USERNAME_TAKEN");
        }
      }

      const updatedUser = await prisma.user.update({
        data,
        select: {
          createdAt: true,
          displayName: true,
          email: true,
          emailVerified: true,
          id: true,
          name: true,
          updatedAt: true,
          username: true,
        },
        where: { id },
      });

      logger.info({ fields: Object.keys(data), userId: id }, "User updated successfully");

      return updatedUser;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error && error.message.includes("P2025")) {
        throw new AppError("User not found", 404, true, "USER_NOT_FOUND");
      }

      logger.error({ error, userId: id }, "Failed to update user");
      throw new AppError("Failed to update user", 500, false, "USER_UPDATE_ERROR");
    }
  }

  async delete(id: string) {
    try {
      await prisma.user.delete({
        where: { id },
      });

      logger.info({ userId: id }, "User deleted successfully");

      return { success: true };
    } catch (error) {
      if (error instanceof Error && error.message.includes("P2025")) {
        throw new AppError("User not found", 404, true, "USER_NOT_FOUND");
      }

      logger.error({ error, userId: id }, "Failed to delete user");
      throw new AppError("Failed to delete user", 500, false, "USER_DELETE_ERROR");
    }
  }

  async list(options: {
    orderBy?: Prisma.UserOrderByWithRelationInput;
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
  }) {
    try {
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          ...options,
          select: {
            createdAt: true,
            displayName: true,
            email: true,
            emailVerified: true,
            id: true,
            name: true,
            username: true,
          },
        }),
        prisma.user.count({ where: options.where }),
      ]);

      return {
        data: users,
        meta: {
          skip: options.skip || 0,
          take: options.take || users.length,
          total,
        },
      };
    } catch (error) {
      logger.error({ error, options }, "Failed to list users");
      throw new AppError("Failed to fetch users", 500, false, "USER_LIST_ERROR");
    }
  }
}

export const userService = new UserService();
