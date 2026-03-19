import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middlewares/authenticate'
import {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from './vehicles.controller'

export async function vehiclesRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate)

  fastify.get('/', listVehicles)
  fastify.get('/:id', getVehicle)
  fastify.post('/', createVehicle)
  fastify.put('/:id', updateVehicle)
  fastify.delete('/:id', deleteVehicle)
}
