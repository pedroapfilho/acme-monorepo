import { logger } from "@/lib/logger";
import { AppError } from "@/middleware/error-handler";
import { prisma } from "@repo/db";
import type { Prisma } from "@repo/db";

export class UserService {
  async findById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          displayName: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new AppError("User not found", 404, true, "USER_NOT_FOUND");
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;

      logger.error({ error, userId: id }, "Failed to find user by ID");
      throw new AppError(
        "Failed to fetch user",
        500,
        false,
        "USER_FETCH_ERROR",
      );
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          displayName: true,
          emailVerified: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      logger.error({ error, email }, "Failed to find user by email");
      throw new AppError(
        "Failed to fetch user",
        500,
        false,
        "USER_FETCH_ERROR",
      );
    }
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    try {
      // Validate username uniqueness if provided
      if (data.username) {
        const existing = await prisma.user.findFirst({
          where: {
            username: data.username as string,
            NOT: { id },
          },
        });

        if (existing) {
          throw new AppError(
            "Username already taken",
            400,
            true,
            "USERNAME_TAKEN",
          );
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          displayName: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.info(
        { userId: id, fields: Object.keys(data) },
        "User updated successfully",
      );

      return updatedUser;
    } catch (error) {
      if (error instanceof AppError) throw error;

      if (error instanceof Error && error.message.includes("P2025")) {
        throw new AppError("User not found", 404, true, "USER_NOT_FOUND");
      }

      logger.error({ error, userId: id }, "Failed to update user");
      throw new AppError(
        "Failed to update user",
        500,
        false,
        "USER_UPDATE_ERROR",
      );
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
      throw new AppError(
        "Failed to delete user",
        500,
        false,
        "USER_DELETE_ERROR",
      );
    }
  }

  async list(options: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    where?: Prisma.UserWhereInput;
  }) {
    try {
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          ...options,
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            displayName: true,
            emailVerified: true,
            createdAt: true,
          },
        }),
        prisma.user.count({ where: options.where }),
      ]);

      return {
        data: users,
        meta: {
          total,
          skip: options.skip || 0,
          take: options.take || users.length,
        },
      };
    } catch (error) {
      logger.error({ error, options }, "Failed to list users");
      throw new AppError(
        "Failed to fetch users",
        500,
        false,
        "USER_LIST_ERROR",
      );
    }
  }
}

export const userService = new UserService();
