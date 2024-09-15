import { getGamesFromDatabase } from "./games.model";

export interface Game {
  id: number;
  season: string;
  date: Date;
  league: string;
  homeClub: string;
  awayClub: string;
  homeShots: number;
  awayShots: number;
  homeCorners: number;
  awayCorners: number;
  homePossession: number;
}

export const getGames = async (): Promise<Game[]> => {
  return getGamesFromDatabase();
};
