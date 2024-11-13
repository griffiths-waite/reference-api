import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { logger } from "../logger.js";

async function endRequest(fastify: FastifyInstance) {
  fastify.addHook("onResponse", async (request, reply) => {
    const { method, originalUrl } = request;
    const { elapsedTime, statusCode } = reply;

    const endTime = new Date();

    const logAttrs = {
      endTime,
      method,
      path: originalUrl,
      duration: elapsedTime,
      status: statusCode,
    };

    if (statusCode >= 400) {
      logger.info(logAttrs, "Sending failure response");
    } else {
      logger.info(logAttrs, "Sending response");
    }

    return;
  });
}

export default fp(endRequest, { name: "end-request" });
