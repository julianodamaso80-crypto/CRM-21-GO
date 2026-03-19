import { FastifyRequest, FastifyReply } from 'fastify'
import { ConveniosService, CreateConvenioDTO, UpdateConvenioDTO } from './convenios.service'

const conveniosService = new ConveniosService()

export class ConveniosController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const convenios = await conveniosService.listConvenios(user.companyId)
    return reply.send(convenios)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const { id } = request.params as { id: string }
    const convenio = await conveniosService.getConvenioById(id, user.companyId)
    return reply.send(convenio)
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const data = request.body as CreateConvenioDTO
    const convenio = await conveniosService.createConvenio(user.companyId, data)
    return reply.status(201).send(convenio)
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const { id } = request.params as { id: string }
    const data = request.body as UpdateConvenioDTO
    const convenio = await conveniosService.updateConvenio(id, user.companyId, data)
    return reply.send(convenio)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const { id } = request.params as { id: string }
    const result = await conveniosService.deleteConvenio(id, user.companyId)
    return reply.send(result)
  }
}
