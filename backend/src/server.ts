import path from 'path'
import fs from 'fs'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import websocket from '@fastify/websocket'
import fastifyStatic from '@fastify/static'

import { env } from './config/env'
import { errorHandler } from './middlewares/error-handler'
import { logger } from './utils/logger'
import { socketService } from './websocket'
import { authRoutes } from './modules/auth/auth.routes.simple'
import { contactsRoutes } from './modules/contacts/contacts.routes'
import { aiRoutes } from './modules/ai/ai.routes'
import { pipesRoutes } from './modules/pipes/pipes.routes'
import { leadsRoutes } from './modules/leads/leads.routes'
import { inboxRoutes } from './modules/inbox/inbox.routes'
import { npsRoutes } from './modules/nps/nps.routes'
import { automationsRoutes } from './modules/automations/automations.routes'
import { webhooksRoutes } from './modules/webhooks/webhooks.routes'
import { dashboardRoutes } from './modules/dashboard/dashboard.routes'
import { analyticsRoutes } from './modules/analytics/analytics.routes'
import { billingRoutes } from './modules/billing/billing.routes'
import { uploadRoutes } from './modules/upload/upload.routes'

const fastify = Fastify({
  logger: logger as any,
  trustProxy: true,
})

async function bootstrap() {
  try {
    // Plugins de segurança
    await fastify.register(helmet, {
      contentSecurityPolicy: false, // Ajustar conforme necessário
    })

    await fastify.register(cors, {
      origin: env.CORS_ORIGIN,
      credentials: true,
    })

    await fastify.register(rateLimit, {
      max: env.RATE_LIMIT_MAX_REQUESTS,
      timeWindow: env.RATE_LIMIT_WINDOW_MS,
    })

    // JWT
    await fastify.register(jwt, {
      secret: env.JWT_SECRET,
      sign: {
        expiresIn: env.JWT_EXPIRES_IN,
      },
    })

    // Multipart (upload de arquivos)
    await fastify.register(multipart, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    })

    // WebSocket
    await fastify.register(websocket)

    // Swagger (documentação API)
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'CRM IA Enterprise API',
          description: 'API completa do CRM SaaS com IA',
          version: '1.0.0',
        },
        servers: [
          {
            url: env.BACKEND_URL,
            description: 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    })

    await fastify.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
      },
      staticCSP: true,
    })

    // Health check
    fastify.get('/health', async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      }
    })

    // Rotas - Core
    await fastify.register(authRoutes, { prefix: '/api/auth' })
    await fastify.register(contactsRoutes, { prefix: '/api/contacts' })
    await fastify.register(aiRoutes, { prefix: '/api/ai' })
    await fastify.register(pipesRoutes, { prefix: '/api/pipes' })

    // Rotas - NPS
    await fastify.register(npsRoutes, { prefix: '/api/nps' })

    // Rotas - CRM & Comunicação
    await fastify.register(leadsRoutes, { prefix: '/api/leads' })
    await fastify.register(inboxRoutes, { prefix: '/api/conversations' })

    // Rotas - Plataforma
    await fastify.register(automationsRoutes, { prefix: '/api/automations' })
    await fastify.register(webhooksRoutes, { prefix: '/api/webhooks' })
    await fastify.register(dashboardRoutes, { prefix: '/api/dashboard' })
    await fastify.register(analyticsRoutes, { prefix: '/api/analytics' })
    await fastify.register(billingRoutes, { prefix: '/api/billing' })
    await fastify.register(uploadRoutes, { prefix: '/api/upload' })

    // Serve frontend static files in production
    const frontendDistPath = path.join(__dirname, '..', '..', 'frontend', 'dist')
    if (fs.existsSync(frontendDistPath)) {
      await fastify.register(fastifyStatic, {
        root: frontendDistPath,
        prefix: '/',
        wildcard: false,
      })

      // SPA fallback: serve index.html for any non-API route
      fastify.setNotFoundHandler((request, reply) => {
        if (request.url.startsWith('/api/')) {
          return reply.status(404).send({ error: 'Not Found', message: 'Route not found' })
        }
        return reply.sendFile('index.html')
      })
    }

    // Error handler global
    fastify.setErrorHandler(errorHandler as any)

    // Start server
    await fastify.listen({
      port: env.PORT,
      host: '0.0.0.0',
    })

    // Initialize Socket.io AFTER server is listening
    await socketService.initialize(fastify)

    console.log(`
    ╔═══════════════════════════════════════════════════╗
    ║                                                   ║
    ║   🚀 CRM IA ENTERPRISE - BACKEND STARTED         ║
    ║                                                   ║
    ║   📍 Server: http://localhost:${env.PORT}              ║
    ║   📚 Docs:   http://localhost:${env.PORT}/docs        ║
    ║   🏥 Health: http://localhost:${env.PORT}/health      ║
    ║   🔌 WebSocket: Connected and ready               ║
    ║                                                   ║
    ║   Environment: ${env.NODE_ENV.toUpperCase().padEnd(35)}║
    ║                                                   ║
    ╚═══════════════════════════════════════════════════╝
    `)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM']
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n${signal} received, closing server gracefully...`)
    await fastify.close()
    process.exit(0)
  })
})

bootstrap()
