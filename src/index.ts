import Fastify from "fastify";
import healthRoute from "./routes/health";
import metricsRoute from "./routes/metrics";
import { gamesRouter } from "./routes/games";

const fastify = Fastify({
  logger: true,
});

fastify.register(healthRoute);
fastify.register(metricsRoute);
fastify.register(gamesRouter);

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
