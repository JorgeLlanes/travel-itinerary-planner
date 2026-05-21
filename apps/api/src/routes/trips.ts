// tripRoutes
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { z } from "zod";
import prisma from "../lib/prisma.js";

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

const TripScheme = z.object({
  title: z.string(),
  destination: z.string(),
  userId: z.string(),
});

async function tripRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  fastify.post("/trips", async (request, reply) => {
    const result = TripScheme.safeParse(request.body);

    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return reply.status(400).send(flattened);
    }

    const user = await prisma.user.findUnique({
      where: { id: result.data.userId },
    });

    if (!user) {
      return reply.status(404).send("User not found");
    }

    const { id, title, destination, status } = await prisma.trip.create({
      data: {
        title: result.data.title,
        destination: result.data.destination,
        userId: result.data.userId,
      },
    });

    return reply.status(201).send({ id, title, destination, status });
  });
}

//ESM
export default tripRoutes;
