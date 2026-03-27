import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/db", () => ({
  prisma: {
    user: {
      count: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/env", () => ({
  env: { NODE_ENV: "test" },
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn() },
}));

import { prisma } from "@repo/db";

import { AppError } from "@/middleware/error-handler";

import { UserService } from "./user.service";

const userService = new UserService();

const mockUser = {
  createdAt: new Date("2024-01-01"),
  displayName: "Test User",
  email: "test@example.com",
  emailVerified: true,
  id: "user-1",
  name: "Test",
  updatedAt: new Date("2024-01-01"),
  username: "testuser",
};

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findById", () => {
    it("should return user when found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

      const result = await userService.findById("user-1");

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "user-1" } }),
      );
    });

    it("should throw AppError 404 when user not found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);

      await expect(userService.findById("missing")).rejects.toThrow(AppError);
      await expect(userService.findById("missing")).rejects.toMatchObject({
        code: "USER_NOT_FOUND",
        statusCode: 404,
      });
    });

    it("should throw AppError 500 on database error", async () => {
      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error("DB connection lost"));

      await expect(userService.findById("user-1")).rejects.toThrow(AppError);
      await expect(userService.findById("user-1")).rejects.toMatchObject({
        code: "USER_FETCH_ERROR",
        statusCode: 500,
      });
    });
  });

  describe("findByEmail", () => {
    it("should return user when found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

      const result = await userService.findByEmail("test@example.com");

      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);

      const result = await userService.findByEmail("missing@example.com");

      expect(result).toBeNull();
    });

    it("should throw AppError 500 on database error", async () => {
      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error("DB error"));

      await expect(userService.findByEmail("test@example.com")).rejects.toMatchObject({
        code: "USER_FETCH_ERROR",
        statusCode: 500,
      });
    });
  });

  describe("update", () => {
    it("should update and return user", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null as never);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser as never);

      const result = await userService.update("user-1", { name: "New Name" });

      expect(result).toEqual(mockUser);
    });

    it("should throw AppError 400 when username is taken", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as never);

      await expect(userService.update("user-2", { username: "testuser" })).rejects.toMatchObject({
        code: "USERNAME_TAKEN",
        statusCode: 400,
      });
    });

    it("should skip username check when username is not provided", async () => {
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser as never);

      await userService.update("user-1", { name: "Updated" });

      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it("should throw AppError 404 on P2025 error", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null as never);
      vi.mocked(prisma.user.update).mockRejectedValue(new Error("Record not found P2025"));

      await expect(userService.update("missing", { name: "X" })).rejects.toMatchObject({
        code: "USER_NOT_FOUND",
        statusCode: 404,
      });
    });

    it("should throw AppError 500 on generic database error", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null as never);
      vi.mocked(prisma.user.update).mockRejectedValue(new Error("Connection refused"));

      await expect(userService.update("user-1", { name: "X" })).rejects.toMatchObject({
        code: "USER_UPDATE_ERROR",
        statusCode: 500,
      });
    });
  });

  describe("delete", () => {
    it("should delete user and return success", async () => {
      vi.mocked(prisma.user.delete).mockResolvedValue(mockUser as never);

      const result = await userService.delete("user-1");

      expect(result).toEqual({ success: true });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
    });

    it("should throw AppError 404 on P2025 error", async () => {
      vi.mocked(prisma.user.delete).mockRejectedValue(new Error("Record not found P2025"));

      await expect(userService.delete("missing")).rejects.toMatchObject({
        code: "USER_NOT_FOUND",
        statusCode: 404,
      });
    });

    it("should throw AppError 500 on generic database error", async () => {
      vi.mocked(prisma.user.delete).mockRejectedValue(new Error("DB error"));

      await expect(userService.delete("user-1")).rejects.toMatchObject({
        code: "USER_DELETE_ERROR",
        statusCode: 500,
      });
    });
  });

  describe("list", () => {
    it("should return users with pagination metadata", async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([mockUser] as never);
      vi.mocked(prisma.user.count).mockResolvedValue(25 as never);

      const result = await userService.list({ skip: 10, take: 10 });

      expect(result.data).toEqual([mockUser]);
      expect(result.meta).toEqual({ skip: 10, take: 10, total: 25 });
    });

    it("should default skip to 0 and take to users length", async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([mockUser] as never);
      vi.mocked(prisma.user.count).mockResolvedValue(1 as never);

      const result = await userService.list({});

      expect(result.meta).toEqual({ skip: 0, take: 1, total: 1 });
    });

    it("should throw AppError 500 on database error", async () => {
      vi.mocked(prisma.user.findMany).mockRejectedValue(new Error("DB error"));

      await expect(userService.list({})).rejects.toMatchObject({
        code: "USER_LIST_ERROR",
        statusCode: 500,
      });
    });
  });
});
