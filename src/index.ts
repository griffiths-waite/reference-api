import Fastify from "fastify";
import oracledb from "oracledb";
import { config } from "./config";
import { logger } from "./logger";
import { gamesRouter } from "./routes/games";
import healthRoute from "./routes/health";
import metricsRoute from "./routes/metrics";
import weatherApiHealthCheck from "./services/weather/health-check";

oracledb.initOracleClient();

const fastify = Fastify({
  logger,
});

fastify.register(healthRoute);
fastify.register(metricsRoute);
fastify.register(gamesRouter);

const start = async () => {
  try {
    await fastify.listen({ port: config.server.port });
    await weatherApiHealthCheck();
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
