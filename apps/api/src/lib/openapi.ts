import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";

const createOpenAPIApp = <V extends Record<string, unknown> = Record<string, never>>() => {
  const app = new OpenAPIHono<{ Variables: V }>();

  app.doc("/openapi.json", {
    info: {
      contact: {
        email: "support@acme.com",
        name: "API Support",
      },
      description: "Acme backend API.",
      title: "Acme API",
      version: "1.0.0",
    },
    openapi: "3.0.0",
    servers: [
      { description: "Local development server", url: "http://localhost:4000" },
      { description: "Production server", url: "https://api.acme.com" },
    ],
    tags: [
      { description: "Service health and readiness", name: "System" },
      { description: "User profile and management", name: "Users" },
    ],
  });

  app.get("/docs", Scalar({ url: "/openapi.json" }));

  return app;
};

export { createOpenAPIApp };
