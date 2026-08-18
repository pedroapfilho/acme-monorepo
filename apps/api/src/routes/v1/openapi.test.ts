import { OpenAPIHono } from "@hono/zod-openapi";
import { createMiddleware } from "hono/factory";
import { describe, expect, it, vi } from "vitest";

import { apiDocumentMetadata } from "@/lib/openapi";
import type { AuthVariables } from "@/middleware/auth";

import { createV1UserRoutes } from "./users";
import type { UserRouteDependencies } from "./users";

const dependencies: UserRouteDependencies = {
  authMiddleware: createMiddleware<{ Variables: AuthVariables }>((_, next) => next()),
  deleteUser: vi.fn<UserRouteDependencies["deleteUser"]>(),
  findUserById: vi.fn<UserRouteDependencies["findUserById"]>(),
  updateUser: vi.fn<UserRouteDependencies["updateUser"]>(),
};

const buildDocument = () => {
  const app = new OpenAPIHono();
  app.route("/api/v1/users", createV1UserRoutes(dependencies));
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
