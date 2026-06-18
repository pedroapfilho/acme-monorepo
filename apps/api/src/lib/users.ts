import { db, user } from "@repo/db";
import { eq } from "drizzle-orm";

import { extractPgCode } from "@/lib/pg-error";
import { AppError } from "@/middleware/error-handler";

const userColumns = {
  createdAt: user.createdAt,
  displayName: user.displayName,
  email: user.email,
  emailVerified: user.emailVerified,
  id: user.id,
  name: user.name,
  updatedAt: user.updatedAt,
  username: user.username,
};

export const findUserById = async (id: string) => {
  const result = await db.query.user.findFirst({ where: eq(user.id, id) });
  if (!result) {
    throw new AppError("User not found", 404, true, "USER_NOT_FOUND");
  }
  return result;
};

export const findUserByEmail = async (email: string) => {
  const found = await db.select(userColumns).from(user).where(eq(user.email, email));
  return found[0] ?? null;
};

type UserUpdateData = {
  displayName?: string | null;
  email?: string;
  image?: string | null;
  name?: string | null;
  username?: string | null;
};

export const updateUser = async (id: string, data: UserUpdateData) => {
  try {
    const [updated] = await db.update(user).set(data).where(eq(user.id, id)).returning(userColumns);
    if (!updated) {
      throw new AppError("User not found", 404, true, "USER_NOT_FOUND");
    }
    return updated;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    // Only a username change can raise a username-uniqueness violation. Guarding
    // on data.username keeps an unrelated 23505 (email, displayUsername) flowing
    // to the central handler as a generic 409 instead of a misleading
    // USERNAME_TAKEN.
    const pgCode = extractPgCode(error);
    if (typeof data.username === "string" && pgCode === "23505") {
      throw new AppError("Username already taken", 409, true, "USERNAME_TAKEN");
    }
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  const [deleted] = await db.delete(user).where(eq(user.id, id)).returning({ id: user.id });
  if (!deleted) {
    throw new AppError("User not found", 404, true, "USER_NOT_FOUND");
  }
  return { success: true };
};
