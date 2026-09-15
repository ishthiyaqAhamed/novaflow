import "dotenv/config"
import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://placeholder:placeholder@db.prisma.io:5432/postgres?sslmode=require"

const globalForDb = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pgPool: Pool | undefined
}

// Reuse persistent pg.Pool to avoid SSL connection handshake latency
const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })

globalForDb.pgPool = pool

function getClient(): PrismaClient {
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

// Ensure the client has the latest models generated
if (globalForDb.prisma && !("deal" in globalForDb.prisma)) {
  globalForDb.prisma = undefined
}

export const db = globalForDb.prisma ?? getClient()

globalForDb.prisma = db