import { FastifyInstance } from 'fastify'
import { WebhooksController } from './webhooks.controller'
import { authenticate } from '../../middlewares/authenticate'

const webhooksController = new WebhooksController()

export async function webhooksRoutes(fastify: FastifyInstance) {
  // Todas as rotas requerem autenticação
  fastify.addHook('onRequest', authenticate)

  // GET /webhooks/events - deve vir antes de /webhooks/:id
  fastify.get('/events', {
    schema: {
      description: 'List available webhook events',
      tags: ['webhooks'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
    handler: webhooksController.getEvents.bind(webhooksController),
  })

  // GET /webhooks
  fastify.get('/', {
    schema: {
      description: 'List webhooks for the company',
      tags: ['webhooks'],
      security: [{ bearerAuth: [] }],
    },
    handler: webhooksController.list.bind(webhooksController),
  })

  // GET /webhooks/:id
  fastify.get('/:id', {
    schema: {
      description: 'Get webhook by ID',
      tags: ['webhooks'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
    handler: webhooksController.getById.bind(webhooksController),
  })

  // POST /webhooks
  fastify.post('/', {
    schema: {
      description: 'Create a new webhook',
      tags: ['webhooks'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          type: {
            type: 'string',
            enum: ['incoming', 'outgoing'],
          },
          url: { type: 'string' },
          method: {
            type: 'string',
            enum: ['GET', 'POST', 'PUT'],
            default: 'POST',
          },
          headers: { type: 'object' },
          event: { type: 'string' },
        },
      },
    },
    handler: webhooksController.create.bind(webhooksController),
  })

  // PUT /webhooks/:id
  fastify.put('/:id', {
    schema: {
      description: 'Update an existing webhook',
      tags: ['webhooks'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          type: {
            type: 'string',
            enum: ['incoming', 'outgoing'],
          },
          url: { type: 'string' },
          method: {
            type: 'string',
            enum: ['GET', 'POST', 'PUT'],
          },
          headers: { type: 'object' },
          event: { type: 'string' },
          isActive: { type: 'boolean' },
        },
      },
    },
    handler: webhooksController.update.bind(webhooksController),
  })

  // DELETE /webhooks/:id
  fastify.delete('/:id', {
    schema: {
      description: 'Delete a webhook',
      tags: ['webhooks'],
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
    handler: webhooksController.delete.bind(webhooksController),
  })
}
