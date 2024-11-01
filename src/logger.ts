import pino, { Logger } from "pino";

export const logger: Logger = pino({
  transport: {
    target: "pino-pretty",
    options: {},
  },
  level: "debug",
});
