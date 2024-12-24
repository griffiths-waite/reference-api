import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      API_PORT: "3000",
      DB_HOST: "db_host",
      DB_PORT: "3000",
      DB_SERVICE: "db_service",
      DB_USERNAME: "db_username",
      DB_PASSWORD: "db_password",
      WEATHER_API_KEY: "fake_api_key",
      WEATHER_BASE_URL: "https://api.openweathermap.org",
      WEATHER_TIMEOUT: "10000",
    },
  },
});
