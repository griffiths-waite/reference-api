import { FastifyInstance } from "fastify";
import { getGames } from "./games.core.js";

export const gamesRouter = async (fastify: FastifyInstance) => {
  fastify.get("/games", async (request, reply) => {
    return getGames();
  });
};
