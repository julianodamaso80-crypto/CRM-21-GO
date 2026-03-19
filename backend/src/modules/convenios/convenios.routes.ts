import { FastifyInstance } from 'fastify'
import { ConveniosController } from './convenios.controller'
import { authenticate } from '../../middlewares/authenticate'

const controller = new ConveniosController()

export async function conveniosRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authenticate)

  fastify.get('/', {
    schema: { description: 'List all convenios', tags: ['convenios'], security: [{ bearerAuth: [] }] },
    handler: controller.list.bind(controller),
  })

  fastify.get('/:id', {
    schema: { description: 'Get convenio by ID', tags: ['convenios'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } } },
    handler: controller.getById.bind(controller),
  })

  fastify.post('/', {
    schema: { description: 'Create a convenio', tags: ['convenios'], security: [{ bearerAuth: [] }] },
    handler: controller.create.bind(controller),
  })

  fastify.put('/:id', {
    schema: { description: 'Update a convenio', tags: ['convenios'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } } },
    handler: controller.update.bind(controller),
  })

  fastify.delete('/:id', {
    schema: { description: 'Delete a convenio', tags: ['convenios'], security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } } },
    handler: controller.delete.bind(controller),
  })
}
