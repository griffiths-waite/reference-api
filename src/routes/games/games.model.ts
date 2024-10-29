import requests from "oracledb";
import { getDBConnection } from "../../oracledb";
import { schemas } from "../../utils/validation";
import { Game } from "./games.core";
import { z } from "zod";

const { seasonIdSchema, leagueIdSchema, clubIdSchema, shotsSchema, cornersSchema, homePosessionSchema, gameIdSchema } = schemas;

const getAllGamesQuery = 'SELECT GAME_ID, SEASON_ID, PLAY_DATE, LEAGUE_ID, HOME_CLUB_ID, AWAY_CLUB_ID, HOME_SHOTS, AWAY_SHOTS, HOME_CORNERS, AWAY_CORNERS, HOME_POSSESSION FROM games';

const dbGameSchema = z.object({
  GAME_ID: gameIdSchema,
  SEASON_ID: seasonIdSchema,
  PLAY_DATE: z.date(),
  LEAGUE_ID: leagueIdSchema,
  HOME_CLUB_ID: clubIdSchema,
  AWAY_CLUB_ID: clubIdSchema,
  HOME_SHOTS: shotsSchema,
  AWAY_SHOTS: shotsSchema,
  HOME_CORNERS: cornersSchema,
  AWAY_CORNERS: cornersSchema,
  HOME_POSSESSION: homePosessionSchema,
}).strict();
type DbGame = z.infer<typeof dbGameSchema>;

const dbGameSchemaArray = z.array(dbGameSchema);

export const getGamesFromDatabase = async (): Promise<Game[]> => {
  let connection;
  try {
    connection = await getDBConnection();
    const result = await connection.execute(getAllGamesQuery, {}, { outFormat: requests.OUT_FORMAT_OBJECT });
    
    //If you are certain the schema is correct and there are no values that could be undefined.
    //const rows = await dbGamesSchemaArray.parseAsync(result.rows || []);

    //If there could be undefined values in the rows, you can use safeParseAsync, log errors, and try using result anyway if you want.
    //Depends on how much you trust the data source, how confident you are in schema covering edge cases, and the consequences of missing data.
    const rows = await dbGameSchemaArray.safeParseAsync(result.rows || []);
    if (!rows.success) {
      console.error(rows.error);
    }

    //If you do parseSync instead of safeParseSync, you would just do rows.maps(...) instead of rows.success ? rows.data : ...
    return (
      (rows.success ? rows.data : ((result.rows || []) as unknown[]) as DbGame[]).map((row): Game => ({
        id: row.GAME_ID,
        season: row.SEASON_ID,
        date: row.PLAY_DATE,
        league: row.LEAGUE_ID,
        homeClub: row.HOME_CLUB_ID,
        awayClub: row.AWAY_CLUB_ID,
        homeShots: row.HOME_SHOTS,
        awayShots: row.AWAY_SHOTS,
        homeCorners: row.HOME_CORNERS,
        awayCorners: row.AWAY_CORNERS,
        homePossession: row.HOME_POSSESSION
      })) || []
    );
  } catch (err) {
    console.error(err);
    return [];
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};
