import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get("/health", async (request, reply) => {
    return { status: "OK" };
  });
}
