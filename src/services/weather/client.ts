import { config } from "../../config";
import baseFetch, { Options } from "../client";

const headers = {
  "Content-Type": "application/json",
};

const client = async <ResponseType>(url: string, options: Options): Promise<ResponseType> => {
  options.query = {
    ...options.query,
    appid: config.weather.apiKey,
  };
  options.timeout = config.weather.timeout;
  options.headers = headers;
  options.excludedQuery = ["appid"];
  return await baseFetch<ResponseType>(url, config.weather.baseUrl, "Weather API", options);
};

export default client;
