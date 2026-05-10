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

async function usersRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  fastify.post("/users", async (request, reply) => {
    const result = UserSchema.safeParse(request.body);
    if (result.success) {
      const user = await prisma.user.findUnique({
        where: { email: result.data.email },
      });
      if (!user) {
        const password = result.data.password;
        const hashedPassword = await bcrypt.hash(password, 10);

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
      } else {
        return reply
          .status(409)
          .send("An account with this email already exists");
      }
    } else {
      const flattened = z.flattenError(result.error);
      return reply.status(400).send(flattened);
    }
  });

  fastify.get("/users/:id", async (request, reply) => {
    return { hello: "world" };
  });
}

//ESM
export default usersRoutes;
