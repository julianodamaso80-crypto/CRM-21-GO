import { FastifyInstance } from 'fastify'
import { AppointmentsController } from './appointments.controller'
import { authenticate } from '../../middlewares/authenticate'

const appointmentsController = new AppointmentsController()

export async function appointmentsRoutes(fastify: FastifyInstance) {
  // Todas as rotas requerem autenticação
  fastify.addHook('onRequest', authenticate)

  // GET /appointments/stats - deve vir antes de /appointments/:id
  fastify.get('/stats', {
    schema: {
      description: 'Get appointments statistics',
      tags: ['appointments'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            today: { type: 'number' },
            thisWeek: { type: 'number' },
            thisMonth: { type: 'number' },
            cancelled: { type: 'number' },
            noShow: { type: 'number' },
            completedToday: { type: 'number' },
            upcomingToday: { type: 'number' },
          },
        },
      },
    },
    handler: appointmentsController.getStats.bind(appointmentsController),
  })

  // GET /appointments/types
  fastify.get('/types', {
    schema: {
      description: 'Get available appointment types',
      tags: ['appointments'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          additionalProperties: { type: 'string' },
        },
      },
    },
    handler: appointmentsController.getTypes.bind(appointmentsController),
  })

  // GET /appointments/availability
  fastify.get('/availability', {
    schema: {
      description: 'Get doctor availability for a specific date',
      tags: ['appointments'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        required: ['doctorId', 'date'],
        properties: {
          doctorId: { type: 'string', format: 'uuid' },
          date: { type: 'string', format: 'date' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            doctorId: { type: 'string' },
            date: { type: 'string' },
            slots: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  startTime: { type: 'string' },
                  endTime: { type: 'string' },
                  available: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    handler: appointmentsController.getAvailability.bind(appointmentsController),
  })

  // GET /appointments
  fastify.get('/', {
    schema: {
      description: 'List appointments with filters',
      tags: ['appointments'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          date: { type: 'string', format: 'date' },
          dateFrom: { type: 'string', format: 'date' },
          dateTo: { type: 'string', format: 'date' },
          doctorId: { type: 'string', format: 'uuid' },
          patientId: { type: 'string', format: 'uuid' },
          status: { type: 'string' },
        },
      },
    },
    handler: appointmentsController.list.bind(appointmentsController),
  })

  // GET /appointments/:id
  fastify.get('/:id', {
    schema: {
      description: 'Get appointment by ID with related data',
      tags: ['appointments'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
    handler: appointmentsController.getById.bind(appointmentsController),
  })

  // POST /appointments
  fastify.post('/', {
    schema: {
      description: 'Create a new appointment',
      tags: ['appointments'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['patientId', 'doctorId', 'type', 'date', 'startTime'],
        properties: {
          patientId: { type: 'string', format: 'uuid' },
          doctorId: { type: 'string', format: 'uuid' },
          type: { type: 'string' },
          date: { type: 'string', format: 'date' },
          startTime: { type: 'string' },
          duration: { type: 'number', minimum: 5 },
          notes: { type: 'string' },
          convenioId: { type: 'string', format: 'uuid' },
          price: { type: 'number' },
          room: { type: 'string' },
        },
      },
    },
    handler: appointmentsController.create.bind(appointmentsController),
  })

  // PUT /appointments/:id
  fastify.put('/:id', {
    schema: {
      description: 'Update an existing appointment',
      tags: ['appointments'],
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
          type: { type: 'string' },
          status: { type: 'string' },
          date: { type: 'string', format: 'date' },
          startTime: { type: 'string' },
          duration: { type: 'number', minimum: 5 },
          notes: { type: 'string' },
          cancellationReason: { type: 'string' },
          price: { type: 'number' },
          isPaid: { type: 'boolean' },
          room: { type: 'string' },
        },
      },
    },
    handler: appointmentsController.update.bind(appointmentsController),
  })

  // DELETE /appointments/:id
  fastify.delete('/:id', {
    schema: {
      description: 'Delete an appointment',
      tags: ['appointments'],
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
    handler: appointmentsController.delete.bind(appointmentsController),
  })
}
