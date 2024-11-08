import client from "./client";

export interface GetCoordinates {
  city: string;
}

export interface Coordinates {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state: string;
}

export const getCoordinates = async ({ city }: GetCoordinates): Promise<Coordinates[]> => {
  return await client<Coordinates[]>("geo/1.0/direct", {
    query: { q: city },
    method: "GET",
  });
};

export interface GetCurrentWeather {
  lat: number;
  lon: number;
}

export interface CurrentWeather {
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
}

export const getCurrentWeather = async ({ lat, lon }: GetCurrentWeather): Promise<CurrentWeather> => {
  return await client<CurrentWeather>("data/2.5/weather", {
    query: { lat, lon },
    method: "GET",
  });
};

export interface GetHistoricWeather {
  lat: number;
  lon: number;
  date: Date;
}

export interface HistoricWeather {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  data: {
    temp: number;
    feels_like: number;
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
  }[];
}

export const getHistoricWeather = async ({ lat, lon, date }: GetHistoricWeather): Promise<HistoricWeather> => {
  return await client<HistoricWeather>("data/3.0/onecall/timemachine", {
    query: {
      lat,
      lon,
      dt: date.getTime() / 1000,
      units: "metric",
    },
    method: "GET",
  });
};

export interface GetHistoricWeatherByCity {
  city: string;
  date: Date;
}

export const getHistoricWeatherByCity = async ({ city, date }: GetHistoricWeatherByCity): Promise<HistoricWeather> => {
  const [{ lat, lon }] = await getCoordinates({ city });
  return await getHistoricWeather({ lat, lon, date });
};
