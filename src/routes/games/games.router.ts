import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getGames } from "./games.core";
import { PlayerId, PositionId, schemas } from "../../utils/validation";

const { seasonIdSchema,
  leagueIdSchema,
  clubIdSchema,
  shotsSchema,
  cornersSchema,
  homePosessionSchema,
  dateStringSchema,
  playerIdSchema,
  positionIdSchema,
  minutesSchema,
  secondsSchema,
  bookingTypeSchema,
} = schemas;

//Check that all playerIds for one team are unique
const uniquePlayersOnOneTeam = (val: { playerId: PlayerId; positionId: PositionId }[]): boolean => {
  const playerIds = val.map((player) => player.playerId);
  return playerIds.length === new Set(playerIds).size;
}

const goalsSchema = z.array(z.object({ playerId: playerIdSchema, matchMinutes: minutesSchema, matchSeconds: secondsSchema, ownGoal: z.boolean().optional() }).strict()).optional()
const teamSheetSchema = z.array(z.object({ playerId: playerIdSchema, positionId: positionIdSchema }).strict()).min(7).max(11).refine(uniquePlayersOnOneTeam, {message: "Duplicate playerId values not allowed."}); //Min to start game is 7 and DB does not have support for substitutes so max 11
const bookingsSchema = z.array(z.object({ playerId: playerIdSchema, matchMinutes: minutesSchema, matchSeconds: secondsSchema, bookingType: bookingTypeSchema }).strict()).optional()

const newGameBodySchema = z.object({
  body: z.object({
    season: seasonIdSchema,
    date: dateStringSchema,
    league: leagueIdSchema,
    homeClub: clubIdSchema,
    awayClub: clubIdSchema,
    homeShots: shotsSchema,
    awayShots: shotsSchema,
    homeCorners: cornersSchema,
    awayCorners: cornersSchema,
    homePossession: homePosessionSchema,
    homeTeam: teamSheetSchema,
    awayTeam: teamSheetSchema,
    homeGoals: goalsSchema,
    awayGoals: goalsSchema,
    bookings: bookingsSchema,
  }).strict()
});
type NewGameBody = z.infer<typeof newGameBodySchema>;

//Check that homeClub and awayClub are different
const differentClubRefinement = (val: NewGameBody): boolean => {
  return val.body.homeClub !== val.body.awayClub
};

//Check that no player is on both teams
const uniquePlayersOnEachTeam = (val: NewGameBody): boolean => {
  const homePlayerIdsSet = new Set(val.body.homeTeam.map((player) => player.playerId));
  const awayPlayerIdsSet = new Set(val.body.awayTeam.map((player) => player.playerId));
  
  let intersection = new Set<PlayerId>()
  for (const elem of awayPlayerIdsSet) {
    if (homePlayerIdsSet.has(elem)) {
      intersection.add(elem)
    }
  }
  return intersection.size === 0;
};

//Check that goals are recorded correctly
//If the goal is an own goal, the player must be on the opposing team
//If the goal is not an own goal, the player must be on the team that scored
const goalsRecordedCorrectly = (val: NewGameBody): boolean => {
   const homePlayerIds = val.body.homeTeam.map((player) => player.playerId);
   const awayPlayerIds = val.body.awayTeam.map((player) => player.playerId);

   for (const goal of val.body.homeGoals || []) {
     if (goal.ownGoal) {
        if (!awayPlayerIds.includes(goal.playerId)) {
          return false;
        }
      } else {
        if (!homePlayerIds.includes(goal.playerId)) {
          return false;
        }
      }
   }

   for (const goal of val.body.awayGoals || []) {
     if (goal.ownGoal) {
        if (!homePlayerIds.includes(goal.playerId)) {
          return false;
        }
      } else {
        if (!awayPlayerIds.includes(goal.playerId)) {
          return false;
        }
      }
   }

    return true;
}

const bookedPlayersPlaying = (val: NewGameBody): boolean => {
  const homePlayerIds = val.body.homeTeam.map((player) => player.playerId);
  const awayPlayerIds = val.body.awayTeam.map((player) => player.playerId);

  for (const booking of val.body.bookings || []) {
    if (!homePlayerIds.includes(booking.playerId) && !awayPlayerIds.includes(booking.playerId)) {
      return false;
    }
  }

  return true;
}

const refinedNewGameBodySchema = newGameBodySchema
  .refine(differentClubRefinement, {message: "homeClub and awayClub cannot be the same."})
  .refine(uniquePlayersOnEachTeam, {message: "Players cannot be on both teams."})
  .refine(goalsRecordedCorrectly, {message: "Goals must be scored by players on the correct team or marked as own goals if scoreed by the opposing team."})
  .refine(bookedPlayersPlaying, {message: "Booked players must be on one of the team sheets."});

export const gamesRouter = async (fastify: FastifyInstance) => {
  fastify.get("/games", async (request, reply) => {
    return getGames();
  });

  fastify.post("/games", async (request, reply) => {
    try{
    const { body } = await refinedNewGameBodySchema.parseAsync(request);
    return { inputValues: { ...body } };
    } catch (err) {
      reply.code(400).send({ message: (err as Error) });
    }
  });
};
