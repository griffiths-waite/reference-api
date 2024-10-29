import { getGamesFromDatabase } from "./games.model";
import { ClubId, Corners, GameId, HomePosession, LeagueId, SeasonId, Shots } from "../../utils/validation";

export interface Game {
  id: GameId;
  season: SeasonId;
  date: Date;
  league: LeagueId;
  homeClub: ClubId;
  awayClub: ClubId;
  homeShots: Shots;
  awayShots: Shots;
  homeCorners: Corners;
  awayCorners: Corners;
  homePossession: HomePosession;
}

export const getGames = async (): Promise<Game[]> => {
  return getGamesFromDatabase();
};
