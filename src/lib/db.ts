import { PrismaClient } from "@prisma/client";

/**
 * En desarrollo Next recarga los módulos en caliente; sin este singleton
 * acabaríamos abriendo una conexión SQLite nueva en cada recarga.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
