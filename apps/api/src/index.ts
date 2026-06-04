import Fastify from "fastify"; 
import usersRoutes from "./routes/users.js";
import tripsRoutes from "./routes/trips.js";
import bookingsRoutes from "./routes/bookings.js";
import flightsRoutes from "./routes/flights.js";

const fastify = Fastify({
  logger: true, 
});

fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

fastify.get("/health", async (request, reply) => {
  return { status: "ok" };
});

fastify.register(usersRoutes);
fastify.register(tripsRoutes);
fastify.register(bookingsRoutes);
fastify.register(flightsRoutes);

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
