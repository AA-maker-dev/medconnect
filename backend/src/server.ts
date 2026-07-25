import http from 'http';
import { createApp } from './app';
import { initSocket } from './socket';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './config/prisma';

async function main() {
  const app = createApp();
  const httpServer = http.createServer(app); 

  initSocket(httpServer);

  await prisma.$connect();
  logger.info('Database connected');

  httpServer.listen(env.PORT, () => {
    logger.info(`MedConnect API listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    httpServer.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
