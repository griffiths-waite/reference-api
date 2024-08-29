import Fastify from "fastify";
import healthRoute from "./routes/health.js";
import metricsRoute from "./routes/metrics.js";
import { gamesRouter } from "./routes/games/games.router.js";
const fastify = Fastify({
  logger: true,
});

fastify.register(healthRoute);
fastify.register(metricsRoute);
fastify.register(gamesRouter);

export const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
