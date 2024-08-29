import { FastifyInstance } from "fastify";
import fastifyMetrics from "fastify-metrics";

export default async function (fastify: FastifyInstance) {
  await fastify.register(fastifyMetrics, { endpoint: "/metrics" });
}
