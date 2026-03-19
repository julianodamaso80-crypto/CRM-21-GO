import type { FastifyRequest, FastifyReply } from 'fastify'
import { VehiclesService } from './vehicles.service'

const vehiclesService = new VehiclesService()

export async function listVehicles(request: FastifyRequest, reply: FastifyReply) {
  const companyId = request.user.companyId
  const query = request.query as any
  const result = await vehiclesService.listVehicles(companyId, {
    page: query.page ? parseInt(query.page) : undefined,
    limit: query.limit ? parseInt(query.limit) : undefined,
    search: query.search,
    associadoId: query.associadoId,
    plano: query.plano,
    ativo: query.ativo !== undefined ? query.ativo === 'true' : undefined,
  })
  return reply.send(result)
}

export async function getVehicle(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const companyId = request.user.companyId
  const vehicle = await vehiclesService.getVehicleById(id, companyId)
  return reply.send(vehicle)
}

export async function getVehiclesByAssociado(request: FastifyRequest, reply: FastifyReply) {
  const { id: associadoId } = request.params as { id: string }
  const companyId = request.user.companyId
  const vehicles = await vehiclesService.getVehiclesByAssociado(associadoId, companyId)
  return reply.send(vehicles)
}

export async function createVehicle(request: FastifyRequest, reply: FastifyReply) {
  const companyId = request.user.companyId
  const data = request.body as any
  const vehicle = await vehiclesService.createVehicle(companyId, data)
  return reply.status(201).send(vehicle)
}

export async function updateVehicle(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const companyId = request.user.companyId
  const data = request.body as any
  const vehicle = await vehiclesService.updateVehicle(id, companyId, data)
  return reply.send(vehicle)
}

export async function deleteVehicle(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const companyId = request.user.companyId
  const result = await vehiclesService.deleteVehicle(id, companyId)
  return reply.send(result)
}
