import { FastifyRequest, FastifyReply } from 'fastify'
import { NPSService, CreateNPSSurveyDTO, SendNPSBatchDTO, ListNPSQuery } from './nps.service'

const npsService = new NPSService()

export class NPSController {
  /**
   * GET /nps
   * Lista pesquisas NPS com filtros
   */
  async list(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId

    const query = request.query as any
    const filters: ListNPSQuery = {
      patientId: query.patientId,
      doctorId: query.doctorId,
      category: query.category,
      answered: query.answered,
    }

    const result = await npsService.listSurveys(companyId, filters)

    return reply.send(result)
  }

  /**
   * POST /nps
   * Cria nova pesquisa NPS
   */
  async create(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const data = request.body as CreateNPSSurveyDTO

    const survey = await npsService.createSurvey(companyId, data)

    return reply.status(201).send(survey)
  }

  /**
   * POST /nps/send-batch
   * Envia pesquisa NPS em lote
   */
  async sendBatch(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const data = request.body as SendNPSBatchDTO

    const result = await npsService.sendBatch(companyId, data)

    return reply.status(201).send(result)
  }

  /**
   * DELETE /nps/:id
   * Deleta pesquisa NPS
   */
  async delete(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const { id } = request.params as { id: string }

    const result = await npsService.deleteSurvey(id, companyId)

    return reply.send(result)
  }

  /**
   * GET /nps/stats
   * Estatísticas NPS completas
   */
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId

    const stats = await npsService.getStats(companyId)

    return reply.send(stats)
  }
}
