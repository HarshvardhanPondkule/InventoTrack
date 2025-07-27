// lib/prisma.ts

import { PrismaClient } from "@prisma/client";

// Extend global type to prevent multiple instances in dev
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Instantiate PrismaClient (log config optional for debugging)
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

// Assign once in dev mode to avoid re-instantiation on HMR
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
