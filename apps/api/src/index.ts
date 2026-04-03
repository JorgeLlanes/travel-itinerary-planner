import Fastify from "fastify"; // Imported Fastify

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
