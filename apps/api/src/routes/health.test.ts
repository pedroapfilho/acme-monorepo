import { OpenAPIHono } from "@hono/zod-openapi";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createHealthRoutes } from "./health";
import type { CheckDatabase } from "./health";

const checkDatabase = vi.fn<CheckDatabase>();

const buildApp = () => {
  const app = new OpenAPIHono();
  app.use("*", (c, next) => {
    c.set("log", { error: () => {}, info: () => {} } as never);
    return next();
  });
  app.route("/", createHealthRoutes(checkDatabase));
  return app;
};

describe("health routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkDatabase.mockResolvedValue();
  });

  it("publishes /healthz and /readyz in the OpenAPI document", () => {
    const doc = buildApp().getOpenAPI31Document({
      info: { title: "Acme API", version: "v1" },
      openapi: "3.1.0",
    });

    expect(doc.paths?.["/healthz"]?.get).toBeDefined();
    expect(doc.paths?.["/readyz"]?.get).toBeDefined();
  });

  it("answers /healthz with the liveness body", async () => {
    const res = await buildApp().request("/healthz");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      service: "api",
      status: "healthy",
      timestamp: expect.any(String),
      version: "1.0.0",
    });
  });

  it("answers /readyz with the readiness body when the database responds", async () => {
    const res = await buildApp().request("/readyz");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      checks: { database: "healthy" },
      status: "ready",
      timestamp: expect.any(String),
    });
  });

  it("answers /readyz with 503 when the database is unreachable", async () => {
    checkDatabase.mockRejectedValue(new Error("connection refused"));

    const res = await buildApp().request("/readyz");

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({
      checks: { database: "unhealthy" },
      status: "not ready",
      timestamp: expect.any(String),
    });
  });
});
