import joi from "joi";
import { validateRequest } from "../validation";
import client from "./client";

const dateSchema = joi.date().required();
const citySchema = joi.string().required();

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

const getCoordinatesSchema = joi.object({
  city: citySchema,
});

export const getCoordinates = async ({ city }: GetCoordinates): Promise<Coordinates[]> => {
  await validateRequest({ city }, getCoordinatesSchema);
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

const getCurrentWeatherSchema = joi.object({
  lat: joi.number().min(-90).max(90).required(),
  lon: joi.number().min(-180).max(180).required(),
});

export const getCurrentWeather = async ({ lat, lon }: GetCurrentWeather): Promise<CurrentWeather> => {
  await validateRequest({ lat, lon }, getCurrentWeatherSchema);
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

const getHistoricWeatherSchema = getCurrentWeatherSchema.append({
  date: dateSchema,
});

export const getHistoricWeather = async ({ lat, lon, date }: GetHistoricWeather): Promise<HistoricWeather> => {
  await validateRequest({ lat, lon, date }, getHistoricWeatherSchema);
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

const getHistoricWeatherByCitySchema = joi.object({
  city: citySchema,
  date: dateSchema,
});

export const getHistoricWeatherByCity = async ({ city, date }: GetHistoricWeatherByCity): Promise<HistoricWeather> => {
  await validateRequest({ city, date }, getHistoricWeatherByCitySchema);
  const [{ lat, lon }] = await getCoordinates({ city });
  return await getHistoricWeather({ lat, lon, date });
};
