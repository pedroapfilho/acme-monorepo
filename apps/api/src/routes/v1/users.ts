import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import type { AuthVariables } from "@/middleware/auth";
import { authMiddleware } from "@/middleware/auth";
import { userService } from "@/services/user.service";

const userSchema = z
  .object({
    createdAt: z.iso.datetime(),
    displayName: z.string().nullable(),
    email: z.email(),
    emailVerified: z.boolean(),
    id: z.string(),
    name: z.string().nullable(),
    updatedAt: z.iso.datetime(),
    username: z.string().nullable(),
  })
  .openapi("User");

const updateUserSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(
        /^[a-zA-Z0-9_\-]+$/v,
        "Username can only contain letters, numbers, underscores, and hyphens",
      )
      .optional(),
  })
  .openapi("UpdateUserInput");

const errorSchema = z
  .object({
    code: z.string().optional(),
    error: z.string(),
  })
  .openapi("Error");

type ServiceUser = Awaited<ReturnType<typeof userService.findById>>;

const serializeUser = (user: ServiceUser) => ({
  ...user,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

const v1UserRoutes = new OpenAPIHono<{ Variables: AuthVariables }>();

const getMeRoute = createRoute({
  description: "Returns the authenticated user's profile.",
  method: "get",
  middleware: [authMiddleware] as const,
  path: "/me",
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ data: userSchema }) } },
      description: "Authenticated user profile",
    },
    401: {
      content: { "application/json": { schema: errorSchema } },
      description: "Unauthorized",
    },
  },
  summary: "Get current user",
  tags: ["Users"],
});

v1UserRoutes.openapi(getMeRoute, async (c) => {
  const user = c.get("user");
  const fullUser = await userService.findById(user.id);
  return c.json({ data: serializeUser(fullUser) }, 200);
});

const updateMeRoute = createRoute({
  description: "Update the authenticated user's profile.",
  method: "patch",
  middleware: [authMiddleware] as const,
  path: "/me",
  request: {
    body: {
      content: { "application/json": { schema: updateUserSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ data: userSchema }) } },
      description: "Updated user profile",
    },
    400: {
      content: { "application/json": { schema: errorSchema } },
      description: "Validation error or username taken",
    },
    401: {
      content: { "application/json": { schema: errorSchema } },
      description: "Unauthorized",
    },
  },
  summary: "Update current user",
  tags: ["Users"],
});

v1UserRoutes.openapi(updateMeRoute, async (c) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  const updatedUser = await userService.update(user.id, data);
  return c.json({ data: serializeUser(updatedUser) }, 200);
});

const deleteMeRoute = createRoute({
  description: "Delete the authenticated user's account.",
  method: "delete",
  middleware: [authMiddleware] as const,
  path: "/me",
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
      description: "Account deleted",
    },
    401: {
      content: { "application/json": { schema: errorSchema } },
      description: "Unauthorized",
    },
  },
  summary: "Delete current user",
  tags: ["Users"],
});

v1UserRoutes.openapi(deleteMeRoute, async (c) => {
  const user = c.get("user");
  await userService.delete(user.id);
  return c.json({ message: "Account deleted successfully" }, 200);
});

// TODO: Add a proper role/permission system (e.g. user.role === "admin").
// Until then, this endpoint returns only the requesting user's own data.
const listUsersRoute = createRoute({
  description:
    "List users. Currently returns only the requesting user pending a role/permission system.",
  method: "get",
  middleware: [authMiddleware] as const,
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(userSchema),
            meta: z.object({
              page: z.number(),
              total: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
      description: "Paginated user list",
    },
    401: {
      content: { "application/json": { schema: errorSchema } },
      description: "Unauthorized",
    },
  },
  summary: "List users",
  tags: ["Users"],
});

v1UserRoutes.openapi(listUsersRoute, async (c) => {
  const user = c.get("user");
  const fullUser = await userService.findById(user.id);

  return c.json(
    {
      data: [serializeUser(fullUser)],
      meta: {
        page: 1,
        total: 1,
        totalPages: 1,
      },
    },
    200,
  );
});

export { v1UserRoutes };
