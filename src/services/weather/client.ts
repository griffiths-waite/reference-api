import { config } from "../../config";
import { logger } from "../../logger";
import { baseFetch, Options } from "../client";

const weatherApiHeaders = {
  "Content-Type": "application/json",
};

export const weatherApi = async <ResponseType>(url: string, options: Options): Promise<ResponseType> => {
  options.query = {
    ...options.query,
    appid: config.weather.apiKey,
  };
  options.timeout = config.weather.timeout;
  options.headers = weatherApiHeaders;
  options.excludedQuery = ["appid"];
  return await baseFetch<ResponseType>(url, config.weather.baseUrl, "Weather API", options);
};
