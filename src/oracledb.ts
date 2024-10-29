import { getConnection, initOracleClient } from "oracledb";
import { config } from "./config";

initOracleClient({ libDir: process.env.DB_INSTANT_CLIENT_DIR ?? undefined });

export const getDBConnection = async () => {
  return await getConnection(config.database);
};
