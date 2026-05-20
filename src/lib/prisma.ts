import { PrismaClient } from '../generated/prisma'

const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set. Prisma will not be able to connect.")
    // Mock the client to prevent crash during build time
    return {
      work: { findMany: async () => [], create: async () => ({}), update: async () => ({}) },
      dailyUpdate: { findMany: async () => [], create: async () => ({}) }
    } as unknown as PrismaClient
  }
  return new PrismaClient()
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
