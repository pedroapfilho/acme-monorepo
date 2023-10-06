import fastify, { FastifyReply, FastifyRequest } from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyEnv from "@fastify/env";
import fastifyHelmet from "@fastify/helmet";
import fastifyRedis from "@fastify/redis";
import fastifyJwt, { JWT } from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";

import authRoutes from "@/routes/auth";
import usersRoutes from "@/routes/users";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: typeof authenticate;

    config: {
      NODE_ENV: string;
      SECRET: string;
      HTTP_HOST: string;
      HTTP_PORT: number;
      REDIS_URL: string;
      AUTOMATION_URL: string;
      CORS_ORIGIN_URL: string;
      RESEND_API_KEY: string;
      TWILIO_ACCOUNT_SID: string;
      TWILIO_AUTH_TOKEN: string;
      TWILLIO_DEVICE_PORT: number;
      EV_API_KEY: string;
    };
  }

  interface FastifyRequest {
    jwt: JWT;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      id: string;
    };
  }
}

const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    return await request.jwtVerify();
  } catch (e) {
    reply.code(403);

    return { error: "NOT_AUTHORIZED" };
  }
};

const createServer = async () => {
  const app = fastify({
    logger: {
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
    },
  });

  const options = {
    dotenv: true,
    data: process.env,
    removeAdditional: true,
    confKey: "config",
    schema: {
      type: "object",
      required: [
        "NODE_ENV",
        "SECRET",
        "HTTP_HOST",
        "HTTP_PORT",
        "CORS_ORIGIN_URL",
      ],
      properties: {
        NODE_ENV: {
          type: "string",
        },
        SECRET: {
          type: "string",
        },
        HTTP_HOST: {
          type: "string",
          default: "0.0.0.0",
        },
        HTTP_PORT: {
          type: "number",
          default: 8000,
        },
        CORS_ORIGIN_URL: {
          type: "string",
        },
        RESEND_API_KEY: {
          type: "string",
        },
      },
    },
  };

  await app.register(fastifyEnv, options);

  app.register(fastifyJwt, {
    secret: app.config.SECRET,
    cookie: {
      cookieName: "token",
      signed: true,
    },
  });

  app.register(fastifyCookie, {
    secret: app.config.SECRET,
  });

  app.decorate("authenticate", authenticate);

  app.addHook("preHandler", (req, _, next) => {
    req.jwt = app.jwt;
    return next();
  });

  app.register(fastifyCors, {
    origin: app.config.CORS_ORIGIN_URL,
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true,
  });

  app.register(fastifyHelmet, { global: true });

  app.register(fastifyRedis, {
    url: app.config.REDIS_URL,
    tls: app.config.NODE_ENV === "production" ? {} : undefined,
  });

  app.get("/healthz", () => {
    return { ok: true };
  });

  app.register(authRoutes, { prefix: "/auth" });
  app.register(usersRoutes, { prefix: "/users" });

  return app;
};

export { createServer };
