// tripRoutes
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { TripStatus } from "../generated/prisma/client.js";
import { cleanUndefined } from "../lib/utils.js";

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

const TripScheme = z.object({
  title: z.string(),
  destination: z.string(),
  userId: z.string(),
  status: z.enum([
    TripStatus.UPCOMING,
    TripStatus.ACTIVE,
    TripStatus.COMPLETED,
    TripStatus.CANCELLED,
  ]),
});

const patchProfileScheme = TripScheme.omit({
  userId: true,
}).partial();

interface ParamsType {
  id: string;
}

async function tripsRoutes(
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

  fastify.get<{ Params: ParamsType }>("/trips/:id", async (request, reply) => {
    const trip = await prisma.trip.findUnique({
      where: { id: request.params.id },
      select: {
        title: true,
        status: true,
        destination: true,
        id: true,
      },
    });

    if (!trip) {
      return reply.status(404).send("No trip found with that ID");
    }
    return reply.status(200).send(trip);
  });

  fastify.patch<{ Params: ParamsType }>(
    "/trips/:id",
    async (request, reply) => {
      const result = patchProfileScheme.safeParse(request.body);

      if (!result.success) {
        const flattened = z.flattenError(result.error);
        return reply.status(400).send(flattened);
      }

      const trip = await prisma.trip.findUnique({
        where: { id: request.params.id },
      });

      if (!trip) {
        return reply.status(404).send("No trip found with that ID");
      }

      const { id, title, destination, status } = await prisma.trip.update({
        where: { id: request.params.id },
        data: cleanUndefined(result.data),
      });
      return reply.status(200).send({ id, title, destination, status });
    },
  );

  fastify.delete<{ Params: ParamsType }>(
    "/trips/:id",
    async (request, reply) => {
      const trip = await prisma.trip.findUnique({
        where: { id: request.params.id },
      });

      if (!trip) {
        return reply.status(404).send("No trip found with that ID");
      }

      const { id, title } = await prisma.trip.delete({
        where: { id: request.params.id },
      });
      return reply
        .status(200)
        .send({ message: `Trip ${title} was successfully deleted`, id });
    },
  );
}

export default tripsRoutes;
