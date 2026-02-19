import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";
import { userService } from "@/services/user.service";

type AuthVariables = {
  user: {
    displayName?: string;
    email: string;
    id: string;
    username?: string;
  };
};

const v1UserRoutes = new Hono<{ Variables: AuthVariables }>();

// Get current user
v1UserRoutes.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");
  const fullUser = await userService.findById(user.id);
  return c.json({ data: fullUser });
});

// Update user profile
const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    )
    .optional(),
});

v1UserRoutes.patch("/me", authMiddleware, zValidator("json", updateUserSchema), async (c) => {
  const user = c.get("user");
  const data = c.req.valid("json");

  const updatedUser = await userService.update(user.id, data);
  return c.json({ data: updatedUser });
});

// Delete user account
v1UserRoutes.delete("/me", authMiddleware, async (c) => {
  const user = c.get("user");
  await userService.delete(user.id);
  return c.json({ message: "Account deleted successfully" });
});

// List users (admin only - for future use)
const listUsersSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  order: z.enum(["asc", "desc"]).default("desc"),
  orderBy: z.enum(["createdAt", "updatedAt", "email"]).default("createdAt"),
  page: z.coerce.number().min(1).default(1),
});

v1UserRoutes.get("/", authMiddleware, zValidator("query", listUsersSchema), async (c) => {
  const { limit, order, orderBy, page } = c.req.valid("query");

  const result = await userService.list({
    orderBy: { [orderBy]: order },
    skip: (page - 1) * limit,
    take: limit,
  });

  return c.json({
    data: result.data,
    meta: {
      ...result.meta,
      page,
      totalPages: Math.ceil(result.meta.total / limit),
    },
  });
});

export { v1UserRoutes };
