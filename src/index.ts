import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifySensible from "@fastify/sensible";
import Fastify, { FastifyError } from "fastify";
import oracledb from "oracledb";
import { v4 as uuidv4 } from "uuid";
import { config } from "./config";
import { logger } from "./logger";
import { gamesRouter } from "./routes/games";
import healthRoute from "./routes/health";
import metricsRoute from "./routes/metrics";
import weatherApiHealthCheck from "./services/weather/health-check";
import { CustomError, defaultError } from "./utils/errors";

oracledb.initOracleClient();

const fastify = Fastify({
  loggerInstance: logger,
  disableRequestLogging: true,
  genReqId: () => uuidv4(),
  requestIdHeader: "correlation-id",
  requestIdLogLabel: "correlationId",
});

// load module plugins
fastify.register(fastifyHelmet);
fastify.register(fastifyCors);
fastify.register(fastifySensible);

fastify.setErrorHandler<CustomError | FastifyError>(
  async (error, _request, reply) => {
    if (error instanceof CustomError) {
      return reply
        .status(error.status)
        .send({ errors: [{ detail: error.message }] });
    }

    if (error.validation) {
      return reply.status(400).send({
        errors: error.validation.map((err) => {
          return {
            detail: err.message,
          };
        }),
      });
    }

    return reply
      .status(error.statusCode ?? 500)
      .send({ errors: [{ detail: defaultError }] });
  }
);

fastify.register(healthRoute);
fastify.register(metricsRoute);
fastify.register(gamesRouter);

const start = async () => {
  try {
    logger.level = config.logging.level;
    await fastify.listen({ port: config.server.port });
    await weatherApiHealthCheck();
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
