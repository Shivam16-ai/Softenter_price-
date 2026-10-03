// SwiftRoute Enterprise - PostgreSQL Database Connection via Prisma ORM
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Global Prisma Client instance (singleton pattern)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown handler
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  logger.info('Prisma Client disconnected gracefully');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  logger.info('Prisma Client disconnected gracefully');
  process.exit(0);
});

export default prisma;

