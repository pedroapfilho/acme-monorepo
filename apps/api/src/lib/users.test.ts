import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/db", () => ({
  prisma: {
    user: {
      delete: vi.fn(),
      findFirst: vi.fn(),
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

import { deleteUser, findUserByEmail, findUserById, updateUser } from "./users";

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

describe("findUserById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user when found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

    const result = await findUserById("user-1");

    expect(result).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "user-1" } }),
    );
  });

  it("throws AppError 404 when user not found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);

    await expect(findUserById("missing")).rejects.toThrow(AppError);
    await expect(findUserById("missing")).rejects.toMatchObject({
      code: "USER_NOT_FOUND",
      statusCode: 404,
    });
  });

  it("throws AppError 500 on database error", async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error("DB connection lost"));

    await expect(findUserById("user-1")).rejects.toThrow(AppError);
    await expect(findUserById("user-1")).rejects.toMatchObject({
      code: "USER_FETCH_ERROR",
      statusCode: 500,
    });
  });
});

describe("findUserByEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user when found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

    const result = await findUserByEmail("test@example.com");

    expect(result).toEqual(mockUser);
  });

  it("returns null when user not found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);

    const result = await findUserByEmail("missing@example.com");

    expect(result).toBeNull();
  });

  it("throws AppError 500 on database error", async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error("DB error"));

    await expect(findUserByEmail("test@example.com")).rejects.toMatchObject({
      code: "USER_FETCH_ERROR",
      statusCode: 500,
    });
  });
});

describe("updateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates and returns user", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null as never);
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser as never);

    const result = await updateUser("user-1", { name: "New Name" });

    expect(result).toEqual(mockUser);
  });

  it("throws AppError 400 when username is taken", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as never);

    await expect(updateUser("user-2", { username: "testuser" })).rejects.toMatchObject({
      code: "USERNAME_TAKEN",
      statusCode: 400,
    });
  });

  it("skips username check when username is not provided", async () => {
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser as never);

    await updateUser("user-1", { name: "Updated" });

    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it("throws AppError 404 on P2025 error", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null as never);
    vi.mocked(prisma.user.update).mockRejectedValue(
      Object.assign(new Error("Record not found"), { clientVersion: "7.0.0", code: "P2025" }),
    );

    await expect(updateUser("missing", { name: "X" })).rejects.toMatchObject({
      code: "USER_NOT_FOUND",
      statusCode: 404,
    });
  });

  it("throws AppError 500 on generic database error", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null as never);
    vi.mocked(prisma.user.update).mockRejectedValue(new Error("Connection refused"));

    await expect(updateUser("user-1", { name: "X" })).rejects.toMatchObject({
      code: "USER_UPDATE_ERROR",
      statusCode: 500,
    });
  });
});

describe("deleteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes user and returns success", async () => {
    vi.mocked(prisma.user.delete).mockResolvedValue(mockUser as never);

    const result = await deleteUser("user-1");

    expect(result).toEqual({ success: true });
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });

  it("throws AppError 404 on P2025 error", async () => {
    vi.mocked(prisma.user.delete).mockRejectedValue(
      Object.assign(new Error("Record not found"), { clientVersion: "7.0.0", code: "P2025" }),
    );

    await expect(deleteUser("missing")).rejects.toMatchObject({
      code: "USER_NOT_FOUND",
      statusCode: 404,
    });
  });

  it("throws AppError 500 on generic database error", async () => {
    vi.mocked(prisma.user.delete).mockRejectedValue(new Error("DB error"));

    await expect(deleteUser("user-1")).rejects.toMatchObject({
      code: "USER_DELETE_ERROR",
      statusCode: 500,
    });
  });
});
