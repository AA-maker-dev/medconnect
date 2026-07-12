import winston from 'winston';
import { env } from '../config/env';

export const logger = winston.createLogger({
  level: env.IS_PROD ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.IS_PROD
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, stack }) => {
            return `${timestamp} [${level}] ${stack ?? message}`;
          })
        )
  ),
  transports: [new winston.transports.Console()],
});
