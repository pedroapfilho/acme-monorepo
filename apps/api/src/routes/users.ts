import { prisma } from "db";
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

  done();
};

export default usersRoutes;
