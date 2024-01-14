import { prisma } from "@repo/db";
import { FastifyInstance } from "fastify";

const usersRoutes = (app: FastifyInstance, _: unknown, done: () => void) => {
  app.get(
    "/me",
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
            phone: true,
          },
        });

        if (!user) {
          reply.code(404);

          return { error: "USER_NOT_FOUND" };
        }

        return user;
      } catch (error) {
        reply.code(500);

        app.log.error(error);

        return { error: "SOMETHING_WENT_WRONG" };
      }
    },
  );

  app.put(
    "/edit",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      try {
        const { id } = request.user;

        if (!id) {
          reply.code(403);

          return;
        }

        const user = await prisma.user.findUnique({
          where: { id },
        });

        if (!user) {
          reply.code(404);

          return { error: "USER_NOT_FOUND" };
        }

        const { name, phone } = request.body as {
          name: string;
          phone: string;
        };

        const updatedUser = await prisma.user.update({
          where: { id },
          data: {
            name,
            phone,
          },
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        });

        return updatedUser;
      } catch (error) {
        reply.code(500);

        app.log.error(error);

        return { error: "SOMETHING_WENT_WRONG" };
      }
    },
  );

  done();
};

export default usersRoutes;
