import Fastify from "fastify"; // Imported Fastify
import usersRoutes from "./routes/users.js";
import tripsRoutes from "./routes/trips.js";
import bookingsRoutes from "./routes/bookings.js";

// Created server instance
const fastify = Fastify({
  logger: true, // Enable logging
});

// Register a GET route for the root path
fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

fastify.get("/health", async (request, reply) => {
  return { status: "ok" };
});

fastify.register(usersRoutes);
fastify.register(tripsRoutes);
fastify.register(bookingsRoutes);

// Starting the server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
