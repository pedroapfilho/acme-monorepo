import { hashPassword, verifyPassword } from "@/utils/hash";
import getResendClient from "@/utils/resend";
import crypto from "crypto";
import { prisma } from "db";
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

        const EXPIRATION_TIME = 14400; // 4h

        const token = app.jwt.sign(
          { id: user.id, name: user.name, email: user.email },
          {
            expiresIn: EXPIRATION_TIME,
          },
        );

        reply.setCookie("token", token, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: EXPIRATION_TIME,
          signed: true,
        });

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

        await resend.emails.send({
          from: "no-reply@no-reply.acme.com",
          to: user.email,
          subject: "Acme - Account Information",
          text: `Hey ${user.name}, your account ID is: ${id}, use it to login into your account with the password you created. We suggest you to write this information somewhere, and delete this email.`,
        });

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
        // TODO: create a ticket on Plain

        return "OK";
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

  done();
};

export default authRoutes;
