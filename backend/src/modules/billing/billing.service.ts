import { prisma } from '../../config/database'
import { AppError } from '../../utils/app-error'

export interface UsageData {
  users: { used: number; limit: number }
  leads: { used: number; limit: number }
  deals: { used: number; limit: number }
  aiMessages: { used: number; limit: number }
  webhooks: { used: number; limit: number }
  apiCalls: { used: number; limit: number }
  storage: { used: number; limit: number }
}

export class BillingService {
  /**
   * Lista todos os planos disponiveis
   */
  async getPlans() {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    })

    return plans
  }

  /**
   * Busca a subscription ativa da empresa
   */
  async getSubscription(companyId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        companyId,
        status: { in: ['active', 'trialing'] },
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!subscription) {
      // Retornar plano free como default
      const freePlan = await prisma.plan.findFirst({
        where: { name: 'free' },
      })

      if (!freePlan) {
        throw new AppError('No free plan found. Please contact support.', 404, 'NOT_FOUND')
      }

      // Retornar subscription virtual com plano free
      return {
        id: null,
        companyId,
        planId: freePlan.id,
        plan: freePlan,
        status: 'active',
        stripeSubscriptionId: null,
        stripeCustomerId: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAt: null,
        canceledAt: null,
        trialStart: null,
        trialEnd: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

    return subscription
  }

  /**
   * Lista faturas da empresa
   */
  async getInvoices(companyId: string) {
    // Buscar subscription da empresa
    const subscription = await prisma.subscription.findFirst({
      where: {
        companyId,
        status: { in: ['active', 'trialing', 'canceled', 'past_due'] },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!subscription) {
      return []
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        companyId,
        subscriptionId: subscription.id,
      },
      orderBy: { createdAt: 'desc' },
    })

    return invoices
  }

  /**
   * Calcula o uso atual da empresa comparado aos limites do plano
   */
  async getUsage(companyId: string): Promise<UsageData> {
    // Buscar subscription ativa para pegar os limites do plano
    const subscription = await this.getSubscription(companyId)
    const plan = subscription.plan

    // Inicio do mes atual
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    // Contar usos atuais
    const [
      usersCount,
      leadsThisMonth,
      cardsThisMonth,
      aiQueriesThisMonth,
      webhooksCount,
    ] = await Promise.all([
      prisma.user.count({
        where: { companyId, isActive: true },
      }),
      prisma.lead.count({
        where: {
          companyId,
          createdAt: { gte: monthStart },
        },
      }),
      prisma.card.count({
        where: {
          companyId,
          createdAt: { gte: monthStart },
        },
      }),
      prisma.aIQueryLog.count({
        where: {
          companyId,
          createdAt: { gte: monthStart },
        },
      }),
      prisma.webhook.count({
        where: { companyId, isActive: true },
      }),
    ])

    // Calcular storage (soma de tamanhos de attachments em bytes, converter para GB)
    const attachmentsSize = await prisma.cardAttachment.aggregate({
      where: { companyId },
      _sum: { size: true },
    })

    const storageUsedBytes = Number(attachmentsSize._sum.size || 0)
    const storageUsedGB = Math.round((storageUsedBytes / (1024 * 1024 * 1024)) * 100) / 100

    return {
      users: {
        used: usersCount,
        limit: plan.maxUsers,
      },
      leads: {
        used: leadsThisMonth,
        limit: plan.maxLeadsPerMonth,
      },
      deals: {
        used: cardsThisMonth,
        limit: plan.maxDealsPerMonth,
      },
      aiMessages: {
        used: aiQueriesThisMonth,
        limit: plan.maxAIMessages,
      },
      webhooks: {
        used: webhooksCount,
        limit: plan.maxWebhooks,
      },
      apiCalls: {
        used: 0, // Placeholder: implementar contagem de API calls
        limit: plan.maxAPICallsPerDay,
      },
      storage: {
        used: storageUsedGB,
        limit: plan.maxStorageGB,
      },
    }
  }

  /**
   * Troca o plano da empresa
   */
  async changePlan(companyId: string, planId: string) {
    // Verificar se plano existe
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      throw new AppError('Plan not found', 404, 'NOT_FOUND')
    }

    if (!plan.isActive) {
      throw new AppError('This plan is no longer available', 400, 'BAD_REQUEST')
    }

    // Buscar subscription ativa
    const subscription = await prisma.subscription.findFirst({
      where: {
        companyId,
        status: { in: ['active', 'trialing'] },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!subscription) {
      // Criar nova subscription
      const newSubscription = await prisma.subscription.create({
        data: {
          companyId,
          planId: plan.id,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        include: { plan: true },
      })

      return newSubscription
    }

    // Atualizar subscription existente
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        planId: plan.id,
        cancelAt: null,
        canceledAt: null,
      },
      include: { plan: true },
    })

    return updatedSubscription
  }

  /**
   * Cancela a subscription da empresa
   */
  async cancelSubscription(companyId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        companyId,
        status: { in: ['active', 'trialing'] },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!subscription) {
      throw new AppError('No active subscription found', 404, 'NOT_FOUND')
    }

    // Cancelar ao final do periodo atual
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'canceled',
        cancelAt: subscription.currentPeriodEnd,
        canceledAt: new Date(),
      },
      include: { plan: true },
    })

    return updatedSubscription
  }
}
