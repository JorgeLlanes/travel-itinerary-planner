// usersRoutes
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

const UserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  password: z.string(),
  twoFactorEnabled: z.boolean().default(false),
});

interface ParamsType {
  id: string;
}

async function usersRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  fastify.post("/users", async (request, reply) => {
    const result = UserSchema.safeParse(request.body);

    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return reply.status(400).send(flattened);
    }

    const user = await prisma.user.findUnique({
      where: { email: result.data.email },
    });
    if (user) {
      return reply
        .status(409)
        .send("An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(result.data.password, 10);

    const { firstName, lastName, email, twoFactorEnabled } =
      await prisma.user.create({
        data: {
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          email: result.data.email,
          password: hashedPassword,
          twoFactorEnabled: result.data.twoFactorEnabled,
        },
      });

    return reply
      .status(201)
      .send({ firstName, lastName, email, twoFactorEnabled });
  });

  fastify.get<{ Params: ParamsType }>("/users/:id", async (request, reply) => {
    const userId = await prisma.user.findUnique({
      where: { id: request.params.id },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        twoFactorEnabled: true,
      },
    });

    if (!userId) {
      return reply.status(404).send("No user found with that ID");
    }
    return reply.status(200).send(userId);
  });

  fastify.get<{ Params: ParamsType }>(
    "/users/:id/trips",
    async (request, reply) => {
      const user = await prisma.user.findUnique({
        where: { id: request.params.id },
      });

      if (!user) {
        return reply.status(404).send("No user found with that ID");
      }

      const trips = await prisma.trip.findMany({
        where: { userId: user.id },
      });
      reply.status(200).send(trips);
    },
  );
}

//ESM
export default usersRoutes;
