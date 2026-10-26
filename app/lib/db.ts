import 'server-only'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/src/generated/prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is required.')
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

// Reuse the connection pool across Next.js development reloads.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
