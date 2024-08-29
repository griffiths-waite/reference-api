import { getConnection } from "oracledb";
import { config } from "./config";

export const getDBConnection = async () => {
  return await getConnection(config.database);
};
