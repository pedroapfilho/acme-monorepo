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

const prismaKnownError = (code: string) =>
  Object.assign(new Error("Prisma error"), { clientVersion: "7.0.0", code });

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

  it("propagates database errors to the central error handler", async () => {
    const dbError = new Error("DB connection lost");
    vi.mocked(prisma.user.findUnique).mockRejectedValue(dbError);

    await expect(findUserById("user-1")).rejects.toThrow(dbError);
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

  it("propagates database errors to the central error handler", async () => {
    const dbError = new Error("DB error");
    vi.mocked(prisma.user.findUnique).mockRejectedValue(dbError);

    await expect(findUserByEmail("test@example.com")).rejects.toThrow(dbError);
  });
});

describe("updateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates and returns user", async () => {
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser as never);

    const result = await updateUser("user-1", { name: "New Name" });

    expect(result).toEqual(mockUser);
  });

  it("throws AppError 409 USERNAME_TAKEN when a username change hits the unique constraint", async () => {
    const conflict = prismaKnownError("P2002");
    vi.mocked(prisma.user.update).mockRejectedValue(conflict);

    await expect(updateUser("user-2", { username: "testuser" })).rejects.toMatchObject({
      code: "USERNAME_TAKEN",
      statusCode: 409,
    });
  });

  it("does NOT mislabel a non-username P2002 as USERNAME_TAKEN", async () => {
    const conflict = prismaKnownError("P2002");
    vi.mocked(prisma.user.update).mockRejectedValue(conflict);

    await expect(updateUser("user-1", { name: "X" })).rejects.toMatchObject({ code: "P2002" });
    await expect(updateUser("user-1", { name: "X" })).rejects.not.toBeInstanceOf(AppError);
  });

  it("propagates P2025 to the central error handler", async () => {
    const notFound = prismaKnownError("P2025");
    vi.mocked(prisma.user.update).mockRejectedValue(notFound);

    await expect(updateUser("missing", { name: "X" })).rejects.toMatchObject({ code: "P2025" });
  });

  it("propagates generic database errors to the central error handler", async () => {
    const dbError = new Error("Connection refused");
    vi.mocked(prisma.user.update).mockRejectedValue(dbError);

    await expect(updateUser("user-1", { name: "X" })).rejects.toThrow(dbError);
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

  it("propagates P2025 to the central error handler", async () => {
    const notFound = prismaKnownError("P2025");
    vi.mocked(prisma.user.delete).mockRejectedValue(notFound);

    await expect(deleteUser("missing")).rejects.toMatchObject({ code: "P2025" });
  });

  it("propagates generic database errors to the central error handler", async () => {
    const dbError = new Error("DB error");
    vi.mocked(prisma.user.delete).mockRejectedValue(dbError);

    await expect(deleteUser("user-1")).rejects.toThrow(dbError);
  });
});
