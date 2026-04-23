import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // Hiện log SQL trong terminal để ông dễ debug
  });

// Lưu instance prisma vào biến global nếu không phải môi trường production
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;