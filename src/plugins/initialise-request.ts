import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { logger } from "../logger.js";

async function initialiseRequest(fastify: FastifyInstance) {
  fastify.addHook("onRequest", async (request, reply) => {
    const { method, originalUrl, body, id } = request;

    if (logger.isLevelEnabled("debug")) {
      logger.debug(
        {
          method,
          path: originalUrl,
          body,
        },
        "Request received"
      );
    } else {
      logger.info(
        {
          method,
          path: originalUrl,
        },
        "Request received"
      );
    }

    reply.header("correlation-Id", id);
  });
}

export default fp(initialiseRequest, { name: "initialise-request" });
