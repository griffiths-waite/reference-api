import { config } from "../../config";
import { logger } from "../../logger";
import { getCurrentWeather } from "./api";

const healthCheck = async () => {
  try {
    if (config.weather.apiKey && config.weather.baseUrl) {
      await getCurrentWeather({ lat: 0, lon: 0 });
      logger.info("(Weather API) Health check passed");
    } else {
      logger.info("(Weather API) Health check skipped");
      config.weather.enabled = false;
    }
  } catch (err) {
    logger.warn(err, "(Weather API) Health check failed");
  }
};

export default healthCheck;
