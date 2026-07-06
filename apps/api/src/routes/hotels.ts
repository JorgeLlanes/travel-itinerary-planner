import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { BookingType } from "../generated/prisma/client.js";
import { moneyAmountString } from "../lib/utils.js";

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

const HotelScheme = z.object({
  hotel: z.string(),
  address: z.string(),
  starRating: z.number().min(1).max(5).multipleOf(0.5),
  amenities: z.array(z.string()).optional(),
  checkInDate: z.iso.datetime(),
  checkOutDate: z.iso.datetime(),
  numOfRooms: z.number().int(),
  numOfGuests: z.number().int(),
  pricePerNight: moneyAmountString(),
  totalPrice: moneyAmountString(),
});

interface ParamsType {
  id: string;
}

async function hotelsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  fastify.post<{ Params: ParamsType }>(
    "/bookings/:id/hotel",
    async (request, reply) => {
      const result = HotelScheme.safeParse(request.body);

      if (!result.success) {
        const flattened = z.flattenError(result.error);
        return reply.status(400).send(flattened);
      }

      const booking = await prisma.booking.findUnique({
        where: { id: request.params.id },
      });

      if (!booking) {
        return reply.status(404).send("No booking found with that ID");
      }

      if (booking.type !== BookingType.HOTEL) {
        return reply.status(400).send("Booking type is not HOTEL");
      }

      const hotelBooking = await prisma.hotelBooking.create({
        data: {
          bookingId: booking.id,
          ...result.data,
          amenities: result.data.amenities ?? [],
        },
      });

      return reply.status(201).send(hotelBooking);
    },
  );
}

export default hotelsRoutes;
