import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import { deleteUser, findUserById, updateUser } from "@/lib/users";
import type { AuthVariables } from "@/middleware/auth";
import { authMiddleware } from "@/middleware/auth";

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

const errorDetailSchema = z.object({ field: z.string(), message: z.string() });

const errorSchema = z
  .object({
    error: z.object({
      code: z.string(),
      details: z.array(errorDetailSchema).optional(),
      message: z.string(),
      stack: z.string().optional(),
    }),
  })
  .openapi("Error");

const userListMetaSchema = z.object({
  page: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

type ServiceUser = Awaited<ReturnType<typeof findUserById>>;

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
  const fullUser = await findUserById(user.id);
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
      description: "Validation error",
    },
    401: {
      content: { "application/json": { schema: errorSchema } },
      description: "Unauthorized",
    },
    409: {
      content: { "application/json": { schema: errorSchema } },
      description: "Username already taken",
    },
  },
  summary: "Update current user",
  tags: ["Users"],
});

v1UserRoutes.openapi(updateMeRoute, async (c) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  const updatedUser = await updateUser(user.id, data);
  return c.json({ data: serializeUser(updatedUser) }, 200);
});

const deleteMeRoute = createRoute({
  description: "Delete the authenticated user's account.",
  method: "delete",
  middleware: [authMiddleware] as const,
  path: "/me",
  responses: {
    204: {
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
  await deleteUser(user.id);
  return c.body(null, 204);
});

// TODO: Add a proper role/permission system (e.g. user.role === "admin").
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
            meta: userListMetaSchema,
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
  const fullUser = await findUserById(user.id);

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
