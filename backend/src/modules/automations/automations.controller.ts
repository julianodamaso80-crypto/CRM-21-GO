import { FastifyRequest, FastifyReply } from 'fastify'
import { AutomationsService, CreateAutomationDTO, UpdateAutomationDTO } from './automations.service'

const automationsService = new AutomationsService()

export class AutomationsController {
  /**
   * GET /automations
   * Lista automações da empresa
   */
  async list(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId

    const result = await automationsService.listAutomations(companyId)

    return reply.send(result)
  }

  /**
   * GET /automations/:id
   * Busca automação por ID
   */
  async getById(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const { id } = request.params as { id: string }

    const automation = await automationsService.getAutomationById(id, companyId)

    return reply.send(automation)
  }

  /**
   * POST /automations
   * Cria nova automação
   */
  async create(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const userId = user.id
    const data = request.body as CreateAutomationDTO

    const automation = await automationsService.createAutomation(companyId, userId, data)

    return reply.status(201).send(automation)
  }

  /**
   * PUT /automations/:id
   * Atualiza automação existente
   */
  async update(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const { id } = request.params as { id: string }
    const data = request.body as UpdateAutomationDTO

    const automation = await automationsService.updateAutomation(id, companyId, data)

    return reply.send(automation)
  }

  /**
   * DELETE /automations/:id
   * Deleta automação
   */
  async delete(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const { id } = request.params as { id: string }

    const result = await automationsService.deleteAutomation(id, companyId)

    return reply.send(result)
  }

  /**
   * GET /automations/triggers
   * Lista triggers disponíveis
   */
  async getTriggers(_request: FastifyRequest, reply: FastifyReply) {
    const triggers = automationsService.getTriggers()

    return reply.send(triggers)
  }

  /**
   * GET /automations/actions
   * Lista ações disponíveis
   */
  async getActions(_request: FastifyRequest, reply: FastifyReply) {
    const actions = automationsService.getActions()

    return reply.send(actions)
  }
}
