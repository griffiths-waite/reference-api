import { logger } from "../../logger";
import { getCurrentWeather } from "./api";

const healthCheck = async () => {
  try {
    await getCurrentWeather({ lat: 0, lon: 0 });
    logger.info("(Weather API) Health check passed");
  } catch (err) {
    logger.warn("(Weather API) Health check failed");
  }
};

export default healthCheck;
