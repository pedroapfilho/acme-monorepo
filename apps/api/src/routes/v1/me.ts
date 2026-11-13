import { createRoute, z } from "@hono/zod-openapi";

import { createRouter } from "@/lib/openapi";
import type { Authenticated } from "@/lib/session";
import { rateLimitResponses } from "@/middleware/security";

const meResponseSchema = z.object({
  data: z.object({ email: z.email(), id: z.string() }).openapi("SessionUser"),
});

const createV1MeRoutes = (authenticated: Authenticated) => {
  const meRoute = createRoute(
    authenticated({
      description: "Returns the user the session belongs to.",
      method: "get",
      path: "/",
      responses: {
        200: {
          content: { "application/json": { schema: meResponseSchema } },
          description: "The signed-in user",
        },
        ...rateLimitResponses,
      },
      summary: "Get the signed-in user",
      tags: ["Account"],
    }),
  );

  return createRouter().openapi(meRoute, (c) => c.json({ data: c.get("user") }, 200));
};

export { createV1MeRoutes };
