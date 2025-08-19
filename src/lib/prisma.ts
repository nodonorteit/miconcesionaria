import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Asignar siempre el cliente de Prisma para evitar problemas en producción
globalForPrisma.prisma = prisma 