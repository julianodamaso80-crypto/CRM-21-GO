import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
})

// Middleware para logging
prisma.$use(async (params: any, next: any) => {
  const before = Date.now()
  const result = await next(params)
  const after = Date.now()

  logger.debug({
    model: params.model,
    action: params.action,
    duration: `${after - before}ms`,
  })

  return result
})

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export { prisma }
