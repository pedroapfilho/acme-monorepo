import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/api-error";

import { createUserService } from "./users";
import type { UserRepository } from "./users";

const userRepository = {
  delete: vi.fn<UserRepository["delete"]>(),
  findUnique: vi.fn<UserRepository["findUnique"]>(),
  update: vi.fn<UserRepository["update"]>(),
};

const { deleteUser, findUserById, updateUser } = createUserService(userRepository);

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
    userRepository.findUnique.mockResolvedValue(mockUser);

    const result = await findUserById("user-1");

    expect(result).toEqual(mockUser);
    expect(userRepository.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "user-1" } }),
    );
  });

  it("throws AppError 404 when user not found", async () => {
    userRepository.findUnique.mockResolvedValue(null);

    await expect(findUserById("missing")).rejects.toThrow(AppError);
    await expect(findUserById("missing")).rejects.toMatchObject({
      code: "USER_NOT_FOUND",
      statusCode: 404,
    });
  });

  it("propagates database errors to the central error handler", async () => {
    const dbError = new Error("DB connection lost");
    userRepository.findUnique.mockRejectedValue(dbError);

    await expect(findUserById("user-1")).rejects.toThrow(dbError);
  });
});

describe("updateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates and returns user", async () => {
    userRepository.update.mockResolvedValue(mockUser);

    const result = await updateUser("user-1", { name: "New Name" });

    expect(result).toEqual(mockUser);
  });

  it("throws AppError 409 USERNAME_TAKEN when a username change hits the unique constraint", async () => {
    const conflict = prismaKnownError("P2002");
    userRepository.update.mockRejectedValue(conflict);

    await expect(updateUser("user-2", { username: "testuser" })).rejects.toMatchObject({
      code: "USERNAME_TAKEN",
      statusCode: 409,
    });
  });

  it("does NOT mislabel a non-username P2002 as USERNAME_TAKEN", async () => {
    const conflict = prismaKnownError("P2002");
    userRepository.update.mockRejectedValue(conflict);

    await expect(updateUser("user-1", { name: "X" })).rejects.toMatchObject({ code: "P2002" });
    await expect(updateUser("user-1", { name: "X" })).rejects.not.toBeInstanceOf(AppError);
  });

  it("propagates P2025 to the central error handler", async () => {
    const notFound = prismaKnownError("P2025");
    userRepository.update.mockRejectedValue(notFound);

    await expect(updateUser("missing", { name: "X" })).rejects.toMatchObject({ code: "P2025" });
  });

  it("propagates generic database errors to the central error handler", async () => {
    const dbError = new Error("Connection refused");
    userRepository.update.mockRejectedValue(dbError);

    await expect(updateUser("user-1", { name: "X" })).rejects.toThrow(dbError);
  });
});

describe("deleteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes user and returns success", async () => {
    userRepository.delete.mockResolvedValue();

    const result = await deleteUser("user-1");

    expect(result).toEqual({ success: true });
    expect(userRepository.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });

  it("propagates P2025 to the central error handler", async () => {
    const notFound = prismaKnownError("P2025");
    userRepository.delete.mockRejectedValue(notFound);

    await expect(deleteUser("missing")).rejects.toMatchObject({ code: "P2025" });
  });

  it("propagates generic database errors to the central error handler", async () => {
    const dbError = new Error("DB error");
    userRepository.delete.mockRejectedValue(dbError);

    await expect(deleteUser("user-1")).rejects.toThrow(dbError);
  });
});
