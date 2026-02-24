import { PrismaClient } from '@prisma/client';
import { PrismaSQLite } from '@prisma/adapter-sqlite';
import Database from 'better-sqlite3';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const db = new Database('./prisma/data/app.db');
const adapter = new PrismaSQLite(db);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;