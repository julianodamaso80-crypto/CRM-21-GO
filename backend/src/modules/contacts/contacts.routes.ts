import { FastifyInstance } from 'fastify'
import { ContactsController } from './contacts.controller'
import { authenticate } from '../../middlewares/authenticate'

const contactsController = new ContactsController()

export async function contactsRoutes(fastify: FastifyInstance) {
  // Todas as rotas requerem autenticação
  fastify.addHook('onRequest', authenticate)

  // GET /contacts/tags - deve vir antes de /contacts/:id
  fastify.get('/tags', {
    schema: {
      description: 'Get unique tags from all contacts',
      tags: ['contacts'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
    handler: contactsController.getTags.bind(contactsController),
  })

  // GET /contacts/stats
  fastify.get('/stats', {
    schema: {
      description: 'Get contacts statistics',
      tags: ['contacts'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            withEmail: { type: 'number' },
            withPhone: { type: 'number' },
            withDeals: { type: 'number' },
            recentCount: { type: 'number' },
          },
        },
      },
    },
    handler: contactsController.getStats.bind(contactsController),
  })

  // GET /contacts
  fastify.get('/', {
    schema: {
      description: 'List contacts with pagination and filters',
      tags: ['contacts'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100 },
          search: { type: 'string' },
          tags: {
            oneOf: [
              { type: 'string' },
              { type: 'array', items: { type: 'string' } },
            ],
          },
          sortBy: {
            type: 'string',
            enum: ['createdAt', 'updatedAt', 'fullName'],
          },
          sortOrder: {
            type: 'string',
            enum: ['asc', 'desc'],
          },
        },
      },
    },
    handler: contactsController.list.bind(contactsController),
  })

  // GET /contacts/:id
  fastify.get('/:id', {
    schema: {
      description: 'Get contact by ID with related data',
      tags: ['contacts'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
    handler: contactsController.getById.bind(contactsController),
  })

  // POST /contacts
  fastify.post('/', {
    schema: {
      description: 'Create a new contact',
      tags: ['contacts'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          jobTitle: { type: 'string' },
          companyName: { type: 'string' },
          whatsapp: { type: 'string' },
          instagram: { type: 'string' },
          linkedin: { type: 'string' },
          twitter: { type: 'string' },
          address: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          country: { type: 'string' },
          zipCode: { type: 'string' },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
          customFields: { type: 'object' },
        },
      },
    },
    handler: contactsController.create.bind(contactsController),
  })

  // PUT /contacts/:id
  fastify.put('/:id', {
    schema: {
      description: 'Update an existing contact',
      tags: ['contacts'],
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
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          jobTitle: { type: 'string' },
          companyName: { type: 'string' },
          whatsapp: { type: 'string' },
          instagram: { type: 'string' },
          linkedin: { type: 'string' },
          twitter: { type: 'string' },
          address: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          country: { type: 'string' },
          zipCode: { type: 'string' },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
          customFields: { type: 'object' },
        },
      },
    },
    handler: contactsController.update.bind(contactsController),
  })

  // DELETE /contacts/:id
  fastify.delete('/:id', {
    schema: {
      description: 'Delete a contact',
      tags: ['contacts'],
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
            message: { type: 'string' },
          },
        },
      },
    },
    handler: contactsController.delete.bind(contactsController),
  })
}
