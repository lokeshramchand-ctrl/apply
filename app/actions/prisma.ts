import { PrismaClient } from "@/lib/generated/prisma/client";

// Ensures we don't create multiple instances during Next.js hot-reloads in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;