import { OpenAPIHono } from "@hono/zod-openapi";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { NODE_ENV: "test" },
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

import { apiDocumentMetadata } from "@/lib/openapi";

import { v1UserRoutes } from "./users";

const buildDocument = () => {
  const app = new OpenAPIHono();
  app.route("/api/v1/users", v1UserRoutes);
  return app.getOpenAPI31Document({ ...apiDocumentMetadata, openapi: "3.1.0" });
};

describe("OpenAPI document", () => {
  it("carries the same identity, servers, and tags on every artifact", () => {
    const doc = buildDocument();

    expect(doc.info).toMatchObject({ title: "Acme API", version: "1.0.0" });
    expect(doc.servers).toEqual(apiDocumentMetadata.servers);
    expect(doc.tags).toEqual(apiDocumentMetadata.tags);
  });

  it("declares the nested { error: { code, message } } shape", () => {
    const doc = buildDocument();

    const errorSchema = doc.components?.schemas?.Error;
    expect(errorSchema).toBeDefined();
    const inner = (errorSchema as { properties?: Record<string, unknown> }).properties?.error as
      | { properties?: Record<string, unknown> }
      | undefined;
    expect(inner?.properties).toMatchObject({
      code: expect.anything(),
      message: expect.anything(),
    });
    const topLevel = (errorSchema as { properties?: Record<string, unknown> }).properties?.error as
      | { type?: string }
      | undefined;
    expect(topLevel?.type).not.toBe("string");
  });
});
