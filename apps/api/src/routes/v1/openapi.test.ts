import { OpenAPIHono } from "@hono/zod-openapi";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { NODE_ENV: "test" },
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

import { v1UserRoutes } from "./users";

describe("OpenAPI document — Error schema", () => {
  it("declares the nested { error: { code, message } } shape", () => {
    const app = new OpenAPIHono();
    app.route("/api/v1/users", v1UserRoutes);
    const doc = app.getOpenAPI31Document({
      info: { title: "Acme API", version: "v1" },
      openapi: "3.1.0",
    });

    const errorSchema = doc.components?.schemas?.Error;
    expect(errorSchema).toBeDefined();
    // nested: error is an object with code + message, NOT a top-level string
    const inner = (errorSchema as { properties?: Record<string, unknown> }).properties?.error as
      | { properties?: Record<string, unknown> }
      | undefined;
    expect(inner?.properties).toMatchObject({
      code: expect.anything(),
      message: expect.anything(),
    });
    // the old flat shape had a top-level string `error`; it must be gone
    const topLevel = (errorSchema as { properties?: Record<string, unknown> }).properties?.error as
      | { type?: string }
      | undefined;
    expect(topLevel?.type).not.toBe("string");
  });
});
