import { FastifyInstance } from 'fastify'
import { ContactsController } from './contacts.controller'
import { authenticate } from '../../middlewares/authenticate'

const contactsController = new ContactsController()

export async function contactsRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authenticate)

  // GET /contacts/tags - deve vir antes de /contacts/:id
  fastify.get('/tags', {
    schema: {
      description: 'Get unique tags from all associados',
      tags: ['associados'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            tags: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    handler: contactsController.getTags.bind(contactsController),
  })

  // GET /contacts/stats
  fastify.get('/stats', {
    schema: {
      description: 'Get associados statistics',
      tags: ['associados'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            ativos: { type: 'number' },
            inativos: { type: 'number' },
            inadimplentes: { type: 'number' },
            emAdesao: { type: 'number' },
            recentCount: { type: 'number' },
            totalVehicles: { type: 'number' },
          },
        },
      },
    },
    handler: contactsController.getStats.bind(contactsController),
  })

  // GET /contacts
  fastify.get('/', {
    schema: {
      description: 'List associados with pagination and filters',
      tags: ['associados'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100 },
          search: { type: 'string' },
          status: { type: 'string' },
          origem: { type: 'string' },
          tags: {
            oneOf: [
              { type: 'string' },
              { type: 'array', items: { type: 'string' } },
            ],
          },
          sortBy: { type: 'string', enum: ['createdAt', 'updatedAt', 'fullName'] },
          sortOrder: { type: 'string', enum: ['asc', 'desc'] },
        },
      },
    },
    handler: contactsController.list.bind(contactsController),
  })

  // GET /contacts/:id
  fastify.get('/:id', {
    schema: {
      description: 'Get associado by ID with related data',
      tags: ['associados'],
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
      description: 'Create a new associado',
      tags: ['associados'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          whatsapp: { type: 'string' },
          cpf: { type: 'string' },
          rg: { type: 'string' },
          dateOfBirth: { type: 'string' },
          address: { type: 'string' },
          bairro: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          country: { type: 'string' },
          zipCode: { type: 'string' },
          status: { type: 'string' },
          dataAdesao: { type: 'string' },
          dataCancelamento: { type: 'string' },
          motivoCancelamento: { type: 'string' },
          hinovaId: { type: 'string' },
          indicadoPor: { type: 'string' },
          vendedorId: { type: 'string' },
          origem: { type: 'string' },
          utmSource: { type: 'string' },
          utmMedium: { type: 'string' },
          utmCampaign: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          customFields: { type: 'object' },
        },
      },
    },
    handler: contactsController.create.bind(contactsController),
  })

  // PUT /contacts/:id
  fastify.put('/:id', {
    schema: {
      description: 'Update an existing associado',
      tags: ['associados'],
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
          whatsapp: { type: 'string' },
          cpf: { type: 'string' },
          rg: { type: 'string' },
          dateOfBirth: { type: 'string' },
          address: { type: 'string' },
          bairro: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          country: { type: 'string' },
          zipCode: { type: 'string' },
          status: { type: 'string' },
          dataAdesao: { type: 'string' },
          dataCancelamento: { type: 'string' },
          motivoCancelamento: { type: 'string' },
          hinovaId: { type: 'string' },
          indicadoPor: { type: 'string' },
          vendedorId: { type: 'string' },
          origem: { type: 'string' },
          utmSource: { type: 'string' },
          utmMedium: { type: 'string' },
          utmCampaign: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          customFields: { type: 'object' },
        },
      },
    },
    handler: contactsController.update.bind(contactsController),
  })

  // DELETE /contacts/:id
  fastify.delete('/:id', {
    schema: {
      description: 'Delete an associado',
      tags: ['associados'],
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
