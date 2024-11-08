import client from "./client";

export interface GetCurrentWeather {
  lat: number;
  lon: number;
}

export interface CurrentWeather {
  data: {
    coord: {
      lon: number;
      lat: number;
    };
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    timezone: number;
    id: number;
    name: string;
    cod: number;
  };
}

export const getCurrentWeather = async ({ lat, lon }: GetCurrentWeather): Promise<CurrentWeather> => {
  return await client<CurrentWeather>("data/2.5/weather", {
    query: { lat, lon },
    method: "GET",
  });
};
