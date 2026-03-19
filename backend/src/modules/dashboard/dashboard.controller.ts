import { FastifyRequest, FastifyReply } from 'fastify'
import { DashboardService } from './dashboard.service'

const dashboardService = new DashboardService()

export class DashboardController {
  /**
   * GET /dashboard/stats
   * Retorna estatisticas agregadas do dashboard
   */
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId

    const stats = await dashboardService.getStats(companyId)

    return reply.send(stats)
  }
}
