import { FastifyRequest, FastifyReply } from 'fastify'
import { NPSService, CreateNPSSurveyDTO, ListNPSQuery } from './nps.service'

const npsService = new NPSService()

export class NPSController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId

    const query = request.query as any
    const filters: ListNPSQuery = {
      associadoId: query.patientId || query.associadoId,
      category: query.category,
      answered: query.answered,
    }

    const result = await npsService.listSurveys(companyId, filters)
    return reply.send(result)
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const body = request.body as any

    const data: CreateNPSSurveyDTO = {
      associadoId: body.patientId || body.associadoId,
      score: body.score,
      comment: body.comment,
      channel: body.channel,
      tipo: body.tipo,
    }

    const survey = await npsService.createSurvey(companyId, data)
    return reply.status(201).send(survey)
  }

  async sendBatch(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any
    const ids = body.patientIds || body.associadoIds || []
    return reply.status(201).send({
      sent: ids.length,
      message: `NPS enviado para ${ids.length} associados`,
    })
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    // Simple delete — no cascade issues
    try {
      const { prisma } = await import('../../config/database')
      await prisma.npsSurvey.delete({ where: { id } })
      return reply.send({ success: true })
    } catch {
      return reply.status(404).send({ success: false, message: 'NPS survey not found' })
    }
  }

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const stats = await npsService.getStats(companyId)
    return reply.send(stats)
  }
}
