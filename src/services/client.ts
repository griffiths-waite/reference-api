import { fetch, RequestInit, Response } from "undici";
import { logger } from "../logger";

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

export const baseFetch = async <ResponseType>(
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

  logger.debug(`Response status: ${response.status}`);

  if (response.ok) {
    const data = (await response.json()) as ResponseType;
    return data;
  } else {
    if (options.errorHandler) {
      return options.errorHandler(response);
    } else {
      const error = new APIError(response);
      logger.error(error, "Error");
      logger.error(await error.json(), "Error response");
      throw error;
    }
  }
};

export const normaliseUrl = (url: string) => {
  return url.startsWith("/") ? url.slice(1) : url;
};

export class APIError extends Error {
  status: number;
  statusText: string;
  #response: Response;

  constructor(response: Response) {
    super("API Error occurred");
    this.name = "APIError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.#response = response;
  }

  async json() {
    return await this.#response.json();
  }
}
