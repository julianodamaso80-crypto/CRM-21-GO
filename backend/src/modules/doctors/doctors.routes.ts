import { FastifyInstance } from 'fastify'
import { DoctorsController } from './doctors.controller'
import { authenticate } from '../../middlewares/authenticate'

const controller = new DoctorsController()

export async function doctorsRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authenticate)

  fastify.get('/specialties', {
    schema: { description: 'Get doctor specialties', tags: ['doctors'], security: [{ bearerAuth: [] }] },
    handler: controller.getSpecialties.bind(controller),
  })

  fastify.get('/', {
    schema: { description: 'List all doctors', tags: ['doctors'], security: [{ bearerAuth: [] }] },
    handler: controller.list.bind(controller),
  })

  fastify.get('/:id', {
    schema: { description: 'Get doctor by ID', tags: ['doctors'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } } },
    handler: controller.getById.bind(controller),
  })

  fastify.post('/', {
    schema: { description: 'Create a doctor', tags: ['doctors'], security: [{ bearerAuth: [] }] },
    handler: controller.create.bind(controller),
  })

  fastify.put('/:id', {
    schema: { description: 'Update a doctor', tags: ['doctors'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } } },
    handler: controller.update.bind(controller),
  })

  fastify.delete('/:id', {
    schema: { description: 'Delete a doctor', tags: ['doctors'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } } },
    handler: controller.delete.bind(controller),
  })
}
