import { fetch, RequestInit, Response } from "undici";
import { logger } from "../logger";
import { APIError } from "./error";

const defaultTimeout = 5000;

export type Query = Record<string, string | string[] | number | number[]>;

export interface Options extends RequestInit {
  query?: Query;
  excludedQuery?: string[];
  timeout?: number;
  serviceName?: string;
  errorHandler?: <T>(response: Response) => T;
}

const formatUrl = (url: string, baseUrl: string, query?: Query, redacted: string[] = []): string => {
  const fullUrl = new URL(url, baseUrl);

  Object.entries(query || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((_value: string | number) =>
        fullUrl.searchParams.append(key, redacted.includes(key) ? "redacted" : String(_value)),
      );
    } else {
      fullUrl.searchParams.append(key, redacted.includes(key) ? "redacted" : String(value));
    }
  });

  return fullUrl.toString();
};

const baseFetch = async <ResponseType>(
  url: string,
  baseUrl: string,
  serviceName: string,
  options: Options,
): Promise<ResponseType> => {
  const fullUrl = formatUrl(url, baseUrl, options.query);

  logger.info(
    {
      method: options.method,
      headers: options.headers,
      url: formatUrl(url, baseUrl, options.query, options.excludedQuery),
    },
    `(${serviceName}) External API request`,
  );

  const response = await fetch(fullUrl, {
    ...options,
    signal: AbortSignal.timeout(options.timeout || defaultTimeout),
  });

  logger.debug({ status: response.status }, `(${serviceName}) External API response`);

  if (response.ok) {
    const data = (await response.json()) as ResponseType;
    return data;
  } else {
    if (options.errorHandler) {
      return options.errorHandler(response);
    } else {
      const error = new APIError(response);
      await error.setJson();
      logger.error(error, `(${serviceName}) External API error`);
      throw error;
    }
  }
};

export default baseFetch;
