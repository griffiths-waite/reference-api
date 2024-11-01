import Fastify from "fastify";
import healthRoute from "./routes/health";
import metricsRoute from "./routes/metrics";
import { gamesRouter } from "./routes/games";
import { logger } from "./logger";
import { getCurrentWeather } from "./services/weather/weather";

const fastify = Fastify({
  logger,
});

fastify.register(healthRoute);
fastify.register(metricsRoute);
fastify.register(gamesRouter);

const weatherApiHealthCheck = async () => {
  try {
    await getCurrentWeather({ lat: 0, lon: 0 });
    logger.info("(Weather API) Health check passed");
  } catch (err) {
    logger.warn("(Weather API) Health check failed");
  }
};

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
