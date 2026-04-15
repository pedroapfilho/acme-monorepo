import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import type { AuthVariables } from "@/middleware/auth";
import { authMiddleware } from "@/middleware/auth";
import { userService } from "@/services/user.service";

const v1UserRoutes = new Hono<{ Variables: AuthVariables }>();

v1UserRoutes.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");
  const fullUser = await userService.findById(user.id);
  return c.json({ data: fullUser });
});

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

v1UserRoutes.delete("/me", authMiddleware, async (c) => {
  const user = c.get("user");
  await userService.delete(user.id);
  return c.json({ message: "Account deleted successfully" });
});

// TODO: Add a proper role/permission system (e.g. user.role === "admin").
// Until then, this endpoint returns only the requesting user's own data.
v1UserRoutes.get("/", authMiddleware, async (c) => {
  const user = c.get("user");
  const fullUser = await userService.findById(user.id);

  return c.json({
    data: [fullUser],
    meta: {
      page: 1,
      total: 1,
      totalPages: 1,
    },
  });
});

export { v1UserRoutes };
