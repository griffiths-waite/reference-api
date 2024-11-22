import { Dispatcher, getGlobalDispatcher, MockAgent, setGlobalDispatcher } from "undici";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  Coordinates,
  CurrentWeather,
  getCurrentWeather,
  getHistoricWeather,
  getHistoricWeatherByCity,
  HistoricWeather,
} from "./api";

describe("weather", () => {
  let mockAgent: MockAgent;
  let originalDispatcher: Dispatcher;

  beforeAll(() => {
    originalDispatcher = getGlobalDispatcher();
    mockAgent = new MockAgent();
    setGlobalDispatcher(mockAgent);
    mockAgent.disableNetConnect();
  });

  afterAll(async () => {
    await mockAgent.close();
    setGlobalDispatcher(originalDispatcher);
  });

  describe("getCurrentWeather", () => {
    const mockedResponse: CurrentWeather = {
      coord: {
        lon: -1.8998,
        lat: 52.4814,
      },
      weather: [
        {
          id: 500,
          main: "Rain",
          description: "light rain",
          icon: "10d",
        },
      ],
      timezone: 3600,
      id: 3333125,
      name: "Birmingham",
      cod: 200,
    };

    it("returns expected response for valid query parameters", async () => {
      mockAgent
        .get("https://api.openweathermap.org")
        .intercept({
          path: "/data/2.5/weather",
          method: "GET",
          query: {
            lat: 0,
            lon: 0,
            appid: "fake_api_key",
          },
        })
        .reply(200, mockedResponse);

      const response = await getCurrentWeather({ lat: 0, lon: 0 });

      expect(response).toEqual(mockedResponse);
    });

    it("handles error response", async () => {
      mockAgent
        .get("https://api.openweathermap.org")
        .intercept({
          path: "/data/2.5/weather",
          method: "GET",
          query: {
            lat: 0,
            lon: 0,
            appid: "fake_api_key",
          },
        })
        .reply(500, { cod: 500, message: "fake error message" });

      const responsePromise = getCurrentWeather({ lat: 0, lon: 0 });

      await expect(responsePromise).rejects.toMatchObject({
        message: "API Error occurred",
        name: "APIError",
        json: { cod: 500, message: "fake error message" },
        status: 500,
      });
    });

    it("throws 400 error for invalid latitude parameter", async () => {
      const responsePromise = getCurrentWeather({ lat: 100, lon: 0 });

      await expect(responsePromise).rejects.toMatchObject({
        message: "lat must be less than or equal to 90",
        status: 400,
      });
    });

    it("throws 400 error for invalid longitude parameter", async () => {
      const responsePromise = getCurrentWeather({ lat: 50, lon: -200 });

      await expect(responsePromise).rejects.toMatchObject({
        message: "lon must be greater than or equal to -180",
        status: 400,
      });
    });

    it("throws 400 error for invalid parameters", async () => {
      const responsePromise = getCurrentWeather({ lat: -100, lon: 200 });

      await expect(responsePromise).rejects.toMatchObject({
        message: "lat must be greater than or equal to -90. lon must be less than or equal to 180",
        status: 400,
      });
    });
  });

  describe("getHistoricWeather", () => {
    const mockedResponse: HistoricWeather = {
      lat: 53.7974,
      lon: -1.5438,
      timezone: "Europe/London",
      timezone_offset: 3600,
      data: [
        {
          temp: 284.84,
          feels_like: 284.6,
          weather: [
            {
              id: 802,
              main: "Clouds",
              description: "scattered clouds",
              icon: "03n",
            },
          ],
        },
      ],
    };

    it("returns expected response for valid query parameters", async () => {
      mockAgent
        .get("https://api.openweathermap.org")
        .intercept({
          path: "/data/3.0/onecall/timemachine",
          method: "GET",
          query: {
            lat: 0,
            lon: 0,
            dt: 1704067200, // https://www.epochconverter.com used for conversion
            appid: "fake_api_key",
            units: "metric",
          },
        })
        .reply(200, mockedResponse);

      const response = await getHistoricWeather({ lat: 0, lon: 0, date: new Date("2024-01-01T00:00:00Z") });
      expect(response).toEqual(mockedResponse);
    });

    it("handles error response", async () => {
      mockAgent
        .get("https://api.openweathermap.org")
        .intercept({
          path: "/data/3.0/onecall/timemachine",
          method: "GET",
          query: {
            lat: 0,
            lon: 0,
            dt: 1704067200, // https://www.epochconverter.com used for conversion
            appid: "fake_api_key",
            units: "metric",
          },
        })
        .reply(500, { cod: 500, message: "fake error message" });

      const responsePromise = getHistoricWeather({ lat: 0, lon: 0, date: new Date("2024-01-01T00:00:00Z") });

      await expect(responsePromise).rejects.toMatchObject({
        message: "API Error occurred",
        name: "APIError",
        json: { cod: 500, message: "fake error message" },
        status: 500,
      });
    });

    it("throws 400 error for invalid date parameter", async () => {
      const responsePromise = getHistoricWeather({ lat: 0, lon: 0, date: "invalid date" as unknown as Date });

      await expect(responsePromise).rejects.toMatchObject({
        message: "date must be a valid date",
        status: 400,
      });
    });
  });

  describe("getHistoricWeatherByCity", () => {
    const mockedCoordinatesResponse: Coordinates[] = [
      {
        name: "Birmingham",
        lat: 52.4796992,
        lon: -1.9026911,
        country: "GB",
        state: "England",
      },
    ];

    const mockedWeatherResponse: HistoricWeather = {
      lat: 53.7974,
      lon: -1.5438,
      timezone: "Europe/London",
      timezone_offset: 3600,
      data: [
        {
          temp: 284.84,
          feels_like: 284.6,
          weather: [
            {
              id: 802,
              main: "Clouds",
              description: "scattered clouds",
              icon: "03n",
            },
          ],
        },
      ],
    };

    it("returns expected response for valid query parameters", async () => {
      mockAgent
        .get("https://api.openweathermap.org")
        .intercept({
          path: "/geo/1.0/direct",
          method: "GET",
          query: {
            q: "Birmingham",
            appid: "fake_api_key",
          },
        })
        .reply(200, mockedCoordinatesResponse);
      mockAgent
        .get("https://api.openweathermap.org")
        .intercept({
          path: "/data/3.0/onecall/timemachine",
          method: "GET",
          query: {
            lat: 52.4796992,
            lon: -1.9026911,
            dt: 1704067200, // https://www.epochconverter.com used for conversion
            appid: "fake_api_key",
            units: "metric",
          },
        })
        .reply(200, mockedWeatherResponse);

      const response = await getHistoricWeatherByCity({ city: "Birmingham", date: new Date("2024-01-01T00:00:00Z") });
      expect(response).toEqual(mockedWeatherResponse);
    });

    it("handles error response", async () => {
      mockAgent
        .get("https://api.openweathermap.org")
        .intercept({
          path: "/geo/1.0/direct",
          method: "GET",
          query: {
            q: "Birmingham",
            appid: "fake_api_key",
          },
        })
        .reply(200, mockedCoordinatesResponse);
      mockAgent
        .get("https://api.openweathermap.org")
        .intercept({
          path: "/data/3.0/onecall/timemachine",
          method: "GET",
          query: {
            lat: 52.4796992,
            lon: -1.9026911,
            dt: 1704067200, // https://www.epochconverter.com used for conversion
            appid: "fake_api_key",
            units: "metric",
          },
        })
        .reply(500, { cod: 500, message: "fake error message" });

      const responsePromise = getHistoricWeatherByCity({ city: "Birmingham", date: new Date("2024-01-01T00:00:00Z") });

      await expect(responsePromise).rejects.toMatchObject({
        message: "API Error occurred",
        name: "APIError",
        json: { cod: 500, message: "fake error message" },
        status: 500,
      });
    });

    it("throws 400 error for invalid city parameter", async () => {
      const responsePromise = getHistoricWeatherByCity({ city: "", date: new Date("2024-01-01T00:00:00Z") });

      await expect(responsePromise).rejects.toMatchObject({
        message: "city is not allowed to be empty",
        status: 400,
      });
    });
  });
});
