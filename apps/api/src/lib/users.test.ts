import { db, user } from "@repo/db";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/middleware/error-handler";

import { deleteUser, findUserByEmail, findUserById, updateUser } from "./users";

const TEST_USER_ID = "test-user-integration";
const TEST_USER_2_ID = "test-user-integration-2";

const makeUser = (overrides?: Partial<typeof user.$inferInsert>) => ({
  email: "integration-test@example.com",
  emailVerified: false,
  id: TEST_USER_ID,
  name: "Integration Test",
  updatedAt: new Date().toISOString(),
  ...overrides,
});

beforeEach(async () => {
  await db.delete(user).where(eq(user.id, TEST_USER_ID));
  await db.delete(user).where(eq(user.id, TEST_USER_2_ID));
  await db.insert(user).values(makeUser());
});

afterEach(async () => {
  await db.delete(user).where(eq(user.id, TEST_USER_ID));
  await db.delete(user).where(eq(user.id, TEST_USER_2_ID));
});

describe("findUserById", () => {
  it("returns user when found", async () => {
    const result = await findUserById(TEST_USER_ID);
    expect(result.id).toBe(TEST_USER_ID);
    expect(result.email).toBe("integration-test@example.com");
  });

  it("throws AppError 404 when user not found", async () => {
    await expect(findUserById("non-existent")).rejects.toMatchObject({
      code: "USER_NOT_FOUND",
      statusCode: 404,
    });
    await expect(findUserById("non-existent")).rejects.toBeInstanceOf(AppError);
  });
});

describe("findUserByEmail", () => {
  it("returns user when found", async () => {
    const result = await findUserByEmail("integration-test@example.com");
    expect(result?.id).toBe(TEST_USER_ID);
  });

  it("returns null when user not found", async () => {
    const result = await findUserByEmail("nobody@example.com");
    expect(result).toBeNull();
  });
});

describe("updateUser", () => {
  it("updates and returns user", async () => {
    const result = await updateUser(TEST_USER_ID, { name: "Updated Name" });
    expect(result.name).toBe("Updated Name");
    expect(result.id).toBe(TEST_USER_ID);
  });

  it("throws AppError 409 USERNAME_TAKEN when a username change hits the unique constraint", async () => {
    await db.insert(user).values(
      makeUser({
        email: "user2@example.com",
        id: TEST_USER_2_ID,
        updatedAt: new Date().toISOString(),
        username: "taken-username",
      }),
    );
    await expect(updateUser(TEST_USER_ID, { username: "taken-username" })).rejects.toMatchObject({
      code: "USERNAME_TAKEN",
      statusCode: 409,
    });
  });

  it("does NOT mislabel a non-username 23505 as USERNAME_TAKEN", async () => {
    await db.insert(user).values(
      makeUser({
        email: "taken-email@example.com",
        id: TEST_USER_2_ID,
        updatedAt: new Date().toISOString(),
      }),
    );
    const caughtError = await updateUser(TEST_USER_ID, { email: "taken-email@example.com" }).catch(
      (error: unknown) => error,
    );
    expect(caughtError).not.toBeInstanceOf(AppError);
    // DrizzleQueryError wraps the pg error in .cause; pg code 23505 lives there.
    expect((caughtError as { cause?: { code?: string } }).cause?.code).toBe("23505");
  });

  it("throws AppError 404 when user not found", async () => {
    await expect(updateUser("non-existent", { name: "X" })).rejects.toMatchObject({
      code: "USER_NOT_FOUND",
      statusCode: 404,
    });
  });
});

describe("deleteUser", () => {
  it("deletes user and returns success", async () => {
    const result = await deleteUser(TEST_USER_ID);
    expect(result).toEqual({ success: true });
    const check = await findUserByEmail("integration-test@example.com");
    expect(check).toBeNull();
  });

  it("throws AppError 404 when user not found", async () => {
    await expect(deleteUser("non-existent")).rejects.toMatchObject({
      code: "USER_NOT_FOUND",
      statusCode: 404,
    });
  });
});

describe("propagates generic database errors", () => {
  it("findUserById rethrows non-AppError db errors unchanged", async () => {
    const dbError = new Error("db connection lost");
    const spy = vi.spyOn(db.query.user, "findFirst").mockRejectedValueOnce(dbError);
    await expect(findUserById(TEST_USER_ID)).rejects.toBe(dbError);
    spy.mockRestore();
  });

  it("findUserByEmail rethrows non-AppError db errors unchanged", async () => {
    const dbError = new Error("db connection lost");
    const spy = vi.spyOn(db, "select").mockImplementationOnce(() => {
      throw dbError;
    });
    await expect(findUserByEmail("integration-test@example.com")).rejects.toBe(dbError);
    spy.mockRestore();
  });

  it("updateUser rethrows non-pg non-AppError db errors unchanged", async () => {
    const dbError = new Error("db connection lost");
    const spy = vi.spyOn(db, "update").mockImplementationOnce(() => {
      throw dbError;
    });
    await expect(updateUser(TEST_USER_ID, { name: "X" })).rejects.toBe(dbError);
    spy.mockRestore();
  });
});

describe("updatedAt auto-advance", () => {
  it("updateUser causes updatedAt to advance", async () => {
    const before = await db.query.user.findFirst({ where: eq(user.id, TEST_USER_ID) });
    const beforeTs = before?.updatedAt ?? "";

    // Small pause to ensure the timestamp can differ
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 10);
    });

    await updateUser(TEST_USER_ID, { name: "Timestamp Check" });
    const after = await db.query.user.findFirst({ where: eq(user.id, TEST_USER_ID) });
    const afterTs = after?.updatedAt ?? "";

    expect(afterTs > beforeTs).toBe(true);
  });
});
