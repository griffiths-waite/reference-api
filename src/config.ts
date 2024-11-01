import dotenv from "dotenv";

dotenv.config();

interface Config {
  database: {
    user: string | undefined;
    password: string | undefined;
    connectString: string | undefined;
  };
  server: {
    port: string | number | undefined;
  };
  weather: {
    apiKey: string;
    baseUrl: string;
    dataApiVersion: string;
    geoApiVersion: string;
    timeout: number;
  };
}

export const config: Config = {
  database: {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${process.env.DB_HOST})(PORT=${process.env.DB_PORT}))(CONNECT_DATA=(SERVICE_NAME=${process.env.DB_SERVICE})))`,
  },
  server: {
    port: process.env.PORT || 3000,
  },
  weather: {
    apiKey: process.env.WEATHER_API_KEY || "",
    baseUrl: process.env.WEATHER_BASE_URL || "",
    dataApiVersion: process.env.WEATHER_DATA_API_VERSION || "2.5",
    geoApiVersion: process.env.WEATHER_GEO_API_VERSION || "1.0",
    timeout: Number(process.env.WEATHER_TIMEOUT) * 1000 || 5000,
  },
};

// Type guard to check if all required environment variables are set
const isConfigValid = (config: Config): boolean => {
  console.log(config);
  return Boolean(
    config.database.user &&
      config.database.password &&
      config.database.connectString &&
      config.weather.apiKey &&
      config.weather.baseUrl,
  );
};

if (!isConfigValid(config)) {
  throw new Error("Missing required environment variables");
}
