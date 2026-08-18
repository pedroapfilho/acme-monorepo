import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { EvlogVariables } from "@repo/observability/hono";

const healthRoute = createRoute({
  description: "Liveness probe; does not touch the database.",
  method: "get",
  path: "/healthz",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            service: z.string(),
            status: z.literal("healthy"),
            timestamp: z.iso.datetime(),
            version: z.string(),
          }),
        },
      },
      description: "API is healthy",
    },
  },
  summary: "Liveness check",
  tags: ["System"],
});

const readyzResponseSchema = z.object({
  checks: z.object({ database: z.enum(["healthy", "unhealthy"]) }),
  status: z.enum(["ready", "not ready"]),
  timestamp: z.iso.datetime(),
});

const readyzRoute = createRoute({
  description: "Readiness probe; verifies the database is reachable.",
  method: "get",
  path: "/readyz",
  responses: {
    200: {
      content: { "application/json": { schema: readyzResponseSchema } },
      description: "API is ready to serve traffic",
    },
    503: {
      content: { "application/json": { schema: readyzResponseSchema } },
      description: "API is not ready (e.g. database unreachable)",
    },
  },
  summary: "Readiness check",
  tags: ["System"],
});

type CheckDatabase = () => Promise<void>;

const createHealthRoutes = (checkDatabase: CheckDatabase) => {
  const healthRoutes = new OpenAPIHono<{ Variables: EvlogVariables["Variables"] }>();

  healthRoutes.openapi(healthRoute, (c) =>
    c.json(
      {
        service: "api",
        status: "healthy" as const,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      },
      200,
    ),
  );

  healthRoutes.openapi(readyzRoute, async (c) => {
    try {
      await checkDatabase();

      return c.json(
        {
          checks: { database: "healthy" as const },
          status: "ready" as const,
          timestamp: new Date().toISOString(),
        },
        200,
      );
    } catch (error) {
      c.get("log").error("Readiness check failed", { error });
      return c.json(
        {
          checks: { database: "unhealthy" as const },
          status: "not ready" as const,
          timestamp: new Date().toISOString(),
        },
        503,
      );
    }
  });

  return healthRoutes;
};

export { createHealthRoutes };
export type { CheckDatabase };
