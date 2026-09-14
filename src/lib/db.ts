import "dotenv/config"
import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

function getClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure the client has the latest models generated
if (globalForPrisma.prisma && !("deal" in globalForPrisma.prisma)) {
  globalForPrisma.prisma = undefined
}

export const db = globalForPrisma.prisma ?? getClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db
}