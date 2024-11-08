import { getHistoricWeatherByCity } from "../../services/weather/api";
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
  location: string;
  weather?: {
    temperature: number;
    feelsLikeTemperature: number;
    description: string;
  };
}

export const getGames = async (): Promise<Game[]> => {
  const games = await getGamesFromDatabase();

  const formattedGames = await Promise.all(
    games.map(async (game) => {
      const weather = await getHistoricWeatherByCity({ city: game.location, date: game.date });
      return {
        ...game,
        weather: {
          temperature: weather.data[0].temp,
          feelsLikeTemperature: weather.data[0].feels_like,
          description: weather.data[0].weather[0].description,
        },
      };
    }),
  );

  return formattedGames;
};
