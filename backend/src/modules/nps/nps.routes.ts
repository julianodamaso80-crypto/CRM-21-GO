import { FastifyInstance } from 'fastify'
import { NPSController } from './nps.controller'
import { authenticate } from '../../middlewares/authenticate'

const npsController = new NPSController()

export async function npsRoutes(fastify: FastifyInstance) {
  // Todas as rotas requerem autenticação
  fastify.addHook('onRequest', authenticate)

  // GET /nps/stats - deve vir antes de rotas com parâmetros
  fastify.get('/stats', {
    schema: {
      description: 'Get NPS statistics and analytics',
      tags: ['nps'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            answeredCount: { type: 'number' },
            responseRate: { type: 'number' },
            promoters: { type: 'number' },
            passives: { type: 'number' },
            detractors: { type: 'number' },
            npsScore: { type: 'number' },
            avgScore: { type: 'number' },
            byMonth: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  month: { type: 'string' },
                  nps: { type: 'number' },
                  responses: { type: 'number' },
                },
              },
            },
            byDoctor: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  doctorId: { type: 'string' },
                  name: { type: 'string' },
                  nps: { type: 'number' },
                  responses: { type: 'number' },
                },
              },
            },
            recentComments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  score: { type: 'number' },
                  category: { type: 'string' },
                  comment: { type: 'string' },
                  patientName: { type: 'string' },
                  doctorName: { type: 'string' },
                  answeredAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
    handler: npsController.getStats.bind(npsController),
  })

  // GET /nps
  fastify.get('/', {
    schema: {
      description: 'List NPS surveys with filters',
      tags: ['nps'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          patientId: { type: 'string', format: 'uuid' },
          doctorId: { type: 'string', format: 'uuid' },
          category: {
            type: 'string',
            enum: ['promoter', 'passive', 'detractor'],
          },
          answered: {
            type: 'string',
            enum: ['true', 'false'],
          },
        },
      },
    },
    handler: npsController.list.bind(npsController),
  })

  // POST /nps
  fastify.post('/', {
    schema: {
      description: 'Create a new NPS survey response',
      tags: ['nps'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['patientId', 'score', 'channel'],
        properties: {
          patientId: { type: 'string', format: 'uuid' },
          doctorId: { type: 'string', format: 'uuid' },
          appointmentId: { type: 'string', format: 'uuid' },
          score: { type: 'number', minimum: 0, maximum: 10 },
          comment: { type: 'string' },
          channel: { type: 'string' },
        },
      },
    },
    handler: npsController.create.bind(npsController),
  })

  // POST /nps/send-batch
  fastify.post('/send-batch', {
    schema: {
      description: 'Send NPS survey to multiple patients',
      tags: ['nps'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['patientIds', 'channel'],
        properties: {
          patientIds: {
            type: 'array',
            items: { type: 'string', format: 'uuid' },
            minItems: 1,
          },
          channel: { type: 'string' },
        },
      },
    },
    handler: npsController.sendBatch.bind(npsController),
  })

  // DELETE /nps/:id
  fastify.delete('/:id', {
    schema: {
      description: 'Delete an NPS survey',
      tags: ['nps'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
          },
        },
      },
    },
    handler: npsController.delete.bind(npsController),
  })
}
