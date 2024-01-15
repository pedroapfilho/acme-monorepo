import { hashPassword, verifyPassword } from "@/utils/hash";
import getResendClient from "@/utils/resend";
import { prisma } from "@repo/db";
import crypto from "crypto";
import { FastifyInstance } from "fastify";

const authRoutes = (app: FastifyInstance, _: unknown, done: () => void) => {
  const resend = getResendClient();

  app.post<{
    Body: {
      id: string;
      password: string;
    };
  }>(
    "/login",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
            password: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: request.body.id },
        });

        if (!user) {
          reply.code(403);

          return { error: "INVALID_ID_OR_PASSWORD" };
        }

        const isCorrectPassword = verifyPassword({
          candidatePassword: request.body.password,
          salt: user.salt,
          hash: user.password,
        });

        if (!isCorrectPassword) {
          reply.code(403);

          return { error: "INVALID_ID_OR_PASSWORD" };
        }

        const token = app.jwt.sign(
          { id: user.id, name: user.name, email: user.email },
          {
            expiresIn: "8h",
          },
        );

        return token;
      } catch (error) {
        reply.code(500);

        app.log.error(error);

        return { error: "SOMETHING_WENT_WRONG" };
      }
    },
  );

  app.post<{
    Body: {
      email: string;
      phone: string;
      password: string;
      name: string;
    };
  }>(
    "/register",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            email: { type: "string" },
            phone: { type: "string" },
            password: { type: "string" },
            name: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { password, ...rest } = request.body;

        const { hash, salt } = hashPassword(password);

        const id = crypto.randomUUID();

        const user = await prisma.user.create({
          data: { ...rest, salt, password: hash, id },
        });

        const response = await resend.emails.send({
          from: "no-reply@no-reply.hasteo.com",
          to: user.email,
          subject: "Hasteo - Account Information",
          text: `Hey ${user.name}, your account ID is: ${id}, use it to login into your account with the password you created. We suggest you to write this information somewhere, and delete this email.`,
        });

        if (response.error) {
          throw new Error("RESEND_ERROR");
        }

        return { id };
      } catch (error) {
        reply.code(500);

        app.log.error(error);

        return { error: "SOMETHING_WENT_WRONG" };
      }
    },
  );

  app.post<{
    Body: {
      email: string;
      password: string;
    };
  }>(
    "/recover",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            email: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // TODO: create a ticket somewhere

        return;
      } catch (error) {
        reply.code(500);

        app.log.error(error);

        return { error: "SOMETHING_WENT_WRONG" };
      }
    },
  );

  app.get(
    "/refresh",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: request.user.id },
          select: {
            id: true,
            email: true,
            name: true,
          },
        });

        if (!user) {
          reply.code(404);

          return { error: "USER_NOT_FOUND" };
        }

        const token = app.jwt.sign(
          { id: user.id, name: user.name, email: user.email },
          {
            expiresIn: "4h",
          },
        );

        return token;
      } catch (error) {
        reply.code(500);

        app.log.error(error);

        return { error: "SOMETHING_WENT_WRONG" };
      }
    },
  );

  app.post<{
    Body: {
      email: string;
    };
  }>(
    "/reset-link",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            email: { type: "string" },
          },
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      try {
        const { email } = request.body;

        const token = app.jwt.sign(
          { email },
          {
            expiresIn: "1h",
          },
        );

        const resetLink = new URL("https://hasteo.com/reset-password");

        resetLink.searchParams.append("email", email);
        resetLink.searchParams.append("token", token);

        const response = await resend.emails.send({
          from: "no-reply@no-reply.hasteo.com",
          to: email,
          subject: "Hasteo - Reset Password",
          text: `Hey, you requested to recover your account, click here to recover it: ${resetLink.href}`,
        });

        if (response.error) {
          throw new Error("RESEND_ERROR");
        }

        return;
      } catch (error) {
        reply.code(500);

        app.log.error(error);

        return { error: "SOMETHING_WENT_WRONG" };
      }
    },
  );

  app.post<{
    Body: {
      email: string;
      token: string;
      password: string;
    };
  }>(
    "/reset-password",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            email: { type: "string" },
            token: { type: "string" },
            password: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, token, password } = request.body;

      const jwt = request.jwt.decode<{ email: string }>(token);

      if (!jwt) {
        reply.code(403);

        return { error: "INVALID_TOKEN" };
      }

      if (jwt.email !== email) {
        reply.code(403);

        return { error: "INVALID_TOKEN" };
      }

      const { hash, salt } = hashPassword(password);

      const user = await prisma.user.update({
        where: { email },
        data: { password: hash, salt },
      });

      if (!user) {
        reply.code(404);

        return { error: "USER_NOT_FOUND" };
      }

      return;
    },
  );

  done();
};

export default authRoutes;
