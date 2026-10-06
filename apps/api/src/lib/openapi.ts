import { OpenAPIHono } from "@hono/zod-openapi";
import { loopbackUrl } from "@repo/portless-env/apps";
import type { Env } from "hono";

const apiDocumentMetadata = {
  info: {
    contact: {
      email: "support@acme.com",
      name: "API Support",
    },
    description: "Acme backend API.",
    title: "Acme API",
    version: "1.0.0",
  },
  servers: [
    { description: "Local development server", url: loopbackUrl("api", "localhost") },
    { description: "Production server", url: "https://api.acme.com" },
  ],
  tags: [
    { description: "Service health and readiness", name: "System" },
    { description: "User profile and management", name: "Users" },
  ],
};

const createRouter = <E extends Env = Env>() =>
  new OpenAPIHono<E>({
    defaultHook: (result) => {
      if (!result.success) {
        throw result.error;
      }
    },
  });

export { apiDocumentMetadata, createRouter };
