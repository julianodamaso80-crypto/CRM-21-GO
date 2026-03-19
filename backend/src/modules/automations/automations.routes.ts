import { FastifyInstance } from 'fastify'
import { AutomationsController } from './automations.controller'
import { authenticate } from '../../middlewares/authenticate'

const automationsController = new AutomationsController()

export async function automationsRoutes(fastify: FastifyInstance) {
  // Todas as rotas requerem autenticação
  fastify.addHook('onRequest', authenticate)

  // GET /automations/triggers - deve vir antes de /automations/:id
  fastify.get('/triggers', {
    schema: {
      description: 'List available automation triggers',
      tags: ['automations'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              label: { type: 'string' },
              events: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
      },
    },
    handler: automationsController.getTriggers.bind(automationsController),
  })

  // GET /automations/actions - deve vir antes de /automations/:id
  fastify.get('/actions', {
    schema: {
      description: 'List available automation actions',
      tags: ['automations'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              label: { type: 'string' },
            },
          },
        },
      },
    },
    handler: automationsController.getActions.bind(automationsController),
  })

  // GET /automations
  fastify.get('/', {
    schema: {
      description: 'List automations for the company',
      tags: ['automations'],
      security: [{ bearerAuth: [] }],
    },
    handler: automationsController.list.bind(automationsController),
  })

  // GET /automations/:id
  fastify.get('/:id', {
    schema: {
      description: 'Get automation by ID',
      tags: ['automations'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
    handler: automationsController.getById.bind(automationsController),
  })

  // POST /automations
  fastify.post('/', {
    schema: {
      description: 'Create a new automation',
      tags: ['automations'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name', 'trigger', 'actions'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          trigger: { type: 'object' },
          conditions: {
            type: 'array',
            items: { type: 'object' },
          },
          actions: {
            type: 'array',
            items: { type: 'object' },
          },
        },
      },
    },
    handler: automationsController.create.bind(automationsController),
  })

  // PUT /automations/:id
  fastify.put('/:id', {
    schema: {
      description: 'Update an existing automation',
      tags: ['automations'],
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
          trigger: { type: 'object' },
          conditions: {
            type: 'array',
            items: { type: 'object' },
          },
          actions: {
            type: 'array',
            items: { type: 'object' },
          },
          isActive: { type: 'boolean' },
        },
      },
    },
    handler: automationsController.update.bind(automationsController),
  })

  // DELETE /automations/:id
  fastify.delete('/:id', {
    schema: {
      description: 'Delete an automation',
      tags: ['automations'],
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
    handler: automationsController.delete.bind(automationsController),
  })
}
