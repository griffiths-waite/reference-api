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
}

export const config: Config = {
  database: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${process.env.DB_HOST})(PORT=${process.env.DB_PORT}))(CONNECT_DATA=(SERVICE_NAME=${process.env.DB_SERVICE})))`,
  },
  server: {
    port: process.env.PORT || 3000,
  },
};

// Type guard to check if all required environment variables are set
const isConfigValid = (config: Config): boolean => {
  return Boolean(
    config.database.user &&
      config.database.password &&
      config.database.connectString
  );
};

if (!isConfigValid(config)) {
  throw new Error("Missing required environment variables");
}
