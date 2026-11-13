import { OpenAPIHono } from "@hono/zod-openapi";
import { contacts, displayName, origins } from "@repo/identity";
import { canonicalUrl } from "@repo/portless-env/apps";
import type { Env } from "hono";

const apiDocumentMetadata = {
  info: {
    contact: {
      email: contacts.support,
      name: "API Support",
    },
    description: `${displayName} backend API.`,
    title: `${displayName} API`,
    version: "1.0.0",
  },
  servers: [
    { description: "Local development server", url: canonicalUrl("api") },
    { description: "Production server", url: origins.api },
  ],
  tags: [
    { description: "Service health and readiness", name: "System" },
    { description: "The signed-in user", name: "Account" },
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
