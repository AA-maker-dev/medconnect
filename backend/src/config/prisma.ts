import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// In dev, tsx watch re-executes this module on every file save. Without
// caching the client on `global`, each reload opens a fresh pool of
// connections against Postgres until it runs out. Production always gets
// a clean singleton per process.
export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: env.IS_PROD ? ['error', 'warn'] : ['error', 'warn'],
  });

if (!env.IS_PROD) {
  global.__prisma = prisma;
}
