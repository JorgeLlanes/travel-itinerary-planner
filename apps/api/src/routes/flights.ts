import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { BookingType, CabinClass } from "../generated/prisma/client.js";
import { moneyAmountString } from "../lib/utils.js";

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

const FlightScheme = z.object({
  airline: z.string(),
  flightNumber: z.string(),
  departureAirportCode: z.string(),
  arrivalAirportCode: z.string(),
  departureDateTime: z.iso.datetime(),
  arrivalDateTime: z.iso.datetime(),
  cabinClass: z.enum([
    CabinClass.ECONOMY,
    CabinClass.PREMIUM_ECONOMY,
    CabinClass.BUSINESS,
    CabinClass.FIRST,
  ]),
  baggageSelection: z.array(z.string()).optional(),
  numOfPassengers: z.number().int(),
  pricePaid: moneyAmountString(),
});

interface ParamsType {
  id: string;
}

async function flightsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  fastify.post<{ Params: ParamsType }>(
    "/bookings/:id/flight",
    async (request, reply) => {
      const result = FlightScheme.safeParse(request.body);

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

      if (booking.type !== BookingType.FLIGHT) {
        return reply.status(400).send("Booking type is not FLIGHT");
      }

      const flightBooking = await prisma.flightBooking.create({
        data: {
          bookingId: booking.id,
          ...result.data,
          baggageSelection: result.data.baggageSelection ?? [],
        },
      });

      return reply.status(201).send(flightBooking);
    },
  );
}

export default flightsRoutes;
