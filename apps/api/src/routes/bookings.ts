import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { BookingType } from "../generated/prisma/client.js";
import { generateConfirmationNumber, moneyAmountString } from "../lib/utils.js";

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

const BookingScheme = z.object({
  tripId: z.string(),
  userId: z.string(),
  type: z.enum([BookingType.FLIGHT, BookingType.HOTEL]),
  totalPrice: moneyAmountString(),
});

interface ParamsType {
  id: string;
}

async function bookingsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  fastify.post("/bookings", async (request, reply) => {
    const result = BookingScheme.safeParse(request.body);

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

    const trip = await prisma.trip.findUnique({
      where: { id: result.data.tripId },
    });

    if (!trip) {
      return reply.status(404).send("Trip not found");
    }

    if (trip.userId !== result.data.userId) {
      return reply.status(403).send("Trip does not belong to this user");
    }

    const confirmationNumberPlaceHolder = generateConfirmationNumber();

    const { id, type, status, confirmationNumber, totalPrice, dateOfBooking } =
      await prisma.booking.create({
        data: {
          tripId: result.data.tripId,
          userId: result.data.userId,
          type: result.data.type,
          confirmationNumber: confirmationNumberPlaceHolder,
          totalPrice: result.data.totalPrice,
        },
      });

    return reply.status(201).send({
      id,
      type,
      status,
      confirmationNumber,
      totalPrice,
      dateOfBooking,
    });
  });

  fastify.get<{ Params: ParamsType }>(
    "/bookings/:id",
    async (request, reply) => {
      const booking = await prisma.booking.findUnique({
        where: { id: request.params.id },
        select: {
          id: true,
          type: true,
          status: true,
          confirmationNumber: true,
          dateOfBooking: true,
          totalPrice: true,
        },
      });
      if (!booking) {
        return reply.status(404).send("No booking found with that ID");
      }
      return reply.status(200).send(booking);
    },
  );
}

export default bookingsRoutes;
