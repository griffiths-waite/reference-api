import Fastify from "fastify";
import { logger } from "./logger";
import { gamesRouter } from "./routes/games";
import healthRoute from "./routes/health";
import metricsRoute from "./routes/metrics";
import weatherApiHealthCheck from "./services/weather/health-check";

const fastify = Fastify({
  logger,
});

fastify.register(healthRoute);
fastify.register(metricsRoute);
fastify.register(gamesRouter);

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    await weatherApiHealthCheck();
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
