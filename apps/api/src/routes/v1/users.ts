import { createRoute, z } from "@hono/zod-openapi";

import { AppError, errorResponse } from "@/lib/api-error";
import { createRouter } from "@/lib/openapi";
import type { Authenticated } from "@/lib/session";
import type { User, UserStore } from "@/lib/users";

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
      .optional()
      .describe(
        "3-30 characters: letters, numbers, underscores, and dots. Stored lowercased; the submitted form is kept as the display username.",
      ),
  })
  .refine((data) => data.name !== undefined || data.username !== undefined, {
    message: "Provide at least one field to update",
  })
  .openapi("UpdateUserInput");

const deleteUserSchema = z
  .object({
    password: z
      .string()
      .min(1)
      .optional()
      .describe("Required unless the session was created within the last day."),
  })
  .openapi("DeleteUserInput");

const userResponseSchema = z.object({ data: userSchema });

const userListResponseSchema = z.object({
  data: z.array(userSchema),
  meta: z.object({
    page: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

const rateLimitedResponses = {
  429: errorResponse("Rate limit exceeded"),
};

type UserRouteDependencies = {
  authenticated: Authenticated;
  users: UserStore;
};

const serializeUser = (user: User) => ({
  ...user,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

const createV1UserRoutes = ({ authenticated, users }: UserRouteDependencies) => {
  const findUser = async (id: string) => {
    const user = await users.find(id);

    if (!user) {
      throw new AppError("User not found", "USER_NOT_FOUND", 404);
    }

    return serializeUser(user);
  };

  const getMeRoute = createRoute(
    authenticated({
      description: "Returns the authenticated user's profile.",
      method: "get",
      path: "/me",
      responses: {
        200: {
          content: { "application/json": { schema: userResponseSchema } },
          description: "Authenticated user profile",
        },
        404: errorResponse("User not found"),
        ...rateLimitedResponses,
      },
      summary: "Get current user",
      tags: ["Users"],
    }),
  );

  const updateMeRoute = createRoute(
    authenticated({
      description: "Update the authenticated user's profile.",
      method: "patch",
      path: "/me",
      request: {
        body: {
          content: { "application/json": { schema: updateUserSchema } },
          required: true,
        },
      },
      responses: {
        200: {
          content: { "application/json": { schema: userResponseSchema } },
          description: "Updated user profile",
        },
        400: errorResponse("Validation failed, or the username is invalid or already taken"),
        409: errorResponse("A concurrent update claimed the same unique value"),
        413: errorResponse("Request body too large"),
        ...rateLimitedResponses,
      },
      summary: "Update current user",
      tags: ["Users"],
    }),
  );

  const deleteMeRoute = createRoute(
    authenticated({
      description: "Delete the authenticated user's account.",
      method: "delete",
      path: "/me",
      request: {
        body: {
          content: { "application/json": { schema: deleteUserSchema } },
          required: false,
        },
      },
      responses: {
        204: {
          description: "Account deleted",
        },
        400: errorResponse("Wrong password, or a stale session without a password"),
        413: errorResponse("Request body too large"),
        ...rateLimitedResponses,
      },
      summary: "Delete current user",
      tags: ["Users"],
    }),
  );

  const listUsersRoute = createRoute(
    authenticated({
      description:
        "List users. Currently returns only the requesting user pending a role/permission system.",
      method: "get",
      path: "/",
      responses: {
        200: {
          content: { "application/json": { schema: userListResponseSchema } },
          description: "Paginated user list",
        },
        ...rateLimitedResponses,
      },
      summary: "List users",
      tags: ["Users"],
    }),
  );

  return createRouter()
    .openapi(getMeRoute, async (c) => c.json({ data: await findUser(c.get("user").id) }, 200))
    .openapi(updateMeRoute, async (c) => {
      await users.update({ data: c.req.valid("json"), headers: c.req.raw.headers });
      return c.json({ data: await findUser(c.get("user").id) }, 200);
    })
    .openapi(deleteMeRoute, async (c) => {
      await users.delete({ headers: c.req.raw.headers, password: c.req.valid("json").password });
      return c.body(null, 204);
    })
    .openapi(listUsersRoute, async (c) => {
      const user = await findUser(c.get("user").id);
      return c.json({ data: [user], meta: { page: 1, total: 1, totalPages: 1 } }, 200);
    });
};

export { createV1UserRoutes };
