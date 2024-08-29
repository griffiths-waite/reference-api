import oracledb from "oracledb";
import { getDBConnection } from "../../oracledb";
import { Game } from "./games.core.js";

export const getGamesFromDatabase = async (): Promise<Game[]> => {
  let connection;
  try {
    connection = await getDBConnection();
    const result = await connection.execute(`SELECT * FROM games`);

    return (
      result.rows?.map((row: any) => ({
        id: row[0] as number,
        season: row[1] as string,
        date: new Date(row[2] as string),
        league: row[3] as string,
        homeClub: row[4] as string,
        awayClub: row[5],
        homeShots: row[6],
        awayShots: row[7],
        homeCorners: row[8],
        awayCorners: row[9],
        homePossession: row[10],
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
