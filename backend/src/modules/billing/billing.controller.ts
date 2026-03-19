import { FastifyRequest, FastifyReply } from 'fastify'
import { BillingService } from './billing.service'

const billingService = new BillingService()

export class BillingController {
  /**
   * GET /billing/plans
   * Lista todos os planos disponiveis
   */
  async getPlans(_request: FastifyRequest, reply: FastifyReply) {
    const plans = await billingService.getPlans()

    return reply.send(plans)
  }

  /**
   * GET /billing/subscription
   * Busca a subscription ativa da empresa
   */
  async getSubscription(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId

    const subscription = await billingService.getSubscription(companyId)

    return reply.send(subscription)
  }

  /**
   * GET /billing/invoices
   * Lista faturas da empresa
   */
  async getInvoices(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId

    const invoices = await billingService.getInvoices(companyId)

    return reply.send(invoices)
  }

  /**
   * GET /billing/usage
   * Calcula uso atual vs limites do plano
   */
  async getUsage(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId

    const usage = await billingService.getUsage(companyId)

    return reply.send(usage)
  }

  /**
   * POST /billing/change-plan
   * Troca o plano da empresa
   */
  async changePlan(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const { planId } = request.body as { planId: string }

    const subscription = await billingService.changePlan(companyId, planId)

    return reply.send(subscription)
  }

  /**
   * POST /billing/cancel
   * Cancela a subscription
   */
  async cancelSubscription(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId

    const subscription = await billingService.cancelSubscription(companyId)

    return reply.send(subscription)
  }
}
