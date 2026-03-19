import { FastifyInstance } from 'fastify'
import { DashboardController } from './dashboard.controller'
import { authenticate } from '../../middlewares/authenticate'

const dashboardController = new DashboardController()

export async function dashboardRoutes(fastify: FastifyInstance) {
  // Todas as rotas requerem autenticacao
  fastify.addHook('onRequest', authenticate)

  // GET /dashboard/stats
  fastify.get('/stats', {
    schema: {
      description: 'Get aggregated dashboard statistics',
      tags: ['dashboard'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            contacts: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                withEmail: { type: 'number' },
                withPhone: { type: 'number' },
                recentCount: { type: 'number' },
              },
            },
            pipes: {
              type: 'object',
              properties: {
                totalPipes: { type: 'number' },
                totalCards: { type: 'number' },
                activeCards: { type: 'number' },
                doneCards: { type: 'number' },
              },
            },
            pipesSummary: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  color: { type: 'string' },
                  totalCards: { type: 'number' },
                  activeCards: { type: 'number' },
                },
              },
            },
            phaseDistribution: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  phaseName: { type: 'string' },
                  phaseColor: { type: 'string' },
                  count: { type: 'number' },
                },
              },
            },
            ai: {
              type: 'object',
              properties: {
                totalQueries: { type: 'number' },
                totalDocuments: { type: 'number' },
                totalAgents: { type: 'number' },
              },
            },
            recentCards: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  status: { type: 'string' },
                  pipeName: { type: 'string' },
                  phaseName: { type: 'string' },
                  phaseColor: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            cardsByDay: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  created: { type: 'number' },
                  completed: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    handler: dashboardController.getStats.bind(dashboardController),
  })
}
