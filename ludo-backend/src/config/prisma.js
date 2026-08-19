import { PrismaClient } from '@prisma/client';

let prisma;

try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
} catch (error) {
  console.warn('⚠️ Prisma Client initialization fallback:', error.message);
  prisma = null;
}

export { prisma };
