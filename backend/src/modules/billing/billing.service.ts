import { prisma } from '../../config/database'

const PLANS = [
  {
    id: 'plan-basico',
    name: 'basico',
    displayName: 'Basico',
    description: 'Roubo/furto + Assistencia 24h (guincho 200km)',
    price: 0,
    currency: 'BRL',
    billingInterval: 'monthly',
    maxUsers: 10,
    maxLeadsPerMonth: 100,
    maxDealsPerMonth: 50,
    maxAIMessages: 500,
    maxWebhooks: 5,
    maxAPICallsPerDay: 1000,
    maxStorageGB: 5,
    features: { rouboFurto: true, assistencia24h: true, guincho200km: true },
    isPopular: false,
  },
  {
    id: 'plan-completo',
    name: 'completo',
    displayName: 'Completo',
    description: 'Basico + Colisao + Incendio + Carro reserva 7 dias',
    price: 0,
    currency: 'BRL',
    billingInterval: 'monthly',
    maxUsers: 50,
    maxLeadsPerMonth: 500,
    maxDealsPerMonth: 200,
    maxAIMessages: 2000,
    maxWebhooks: 20,
    maxAPICallsPerDay: 5000,
    maxStorageGB: 20,
    features: { rouboFurto: true, assistencia24h: true, guincho200km: true, colisao: true, incendio: true, carroReserva7: true },
    isPopular: true,
  },
  {
    id: 'plan-premium',
    name: 'premium',
    displayName: 'Premium',
    description: 'Completo + Terceiros R$100K + Vidros + Carro reserva 15 dias + Rastreamento',
    price: 0,
    currency: 'BRL',
    billingInterval: 'monthly',
    maxUsers: -1,
    maxLeadsPerMonth: -1,
    maxDealsPerMonth: -1,
    maxAIMessages: -1,
    maxWebhooks: -1,
    maxAPICallsPerDay: -1,
    maxStorageGB: 100,
    features: { rouboFurto: true, assistencia24h: true, guincho200km: true, colisao: true, incendio: true, carroReserva15: true, terceiros100k: true, vidros: true, rastreamento: true },
    isPopular: false,
  },
]

export class BillingService {
  async getPlans() {
    return PLANS
  }

  async getSubscription(companyId: string) {
    return {
      id: 'sub-21go',
      companyId,
      planId: 'plan-premium',
      plan: PLANS[2],
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAt: null,
      canceledAt: null,
    }
  }

  async getInvoices(_companyId: string) {
    return []
  }

  async getUsage(companyId: string) {
    const [users, leads, cards, agents] = await Promise.all([
      prisma.user.count({ where: { companyId } }),
      prisma.lead.count({ where: { companyId } }),
      prisma.card.count({ where: { companyId } }),
      prisma.aIAgent.count({ where: { companyId } }),
    ])

    return {
      users: { used: users, limit: -1 },
      leads: { used: leads, limit: -1 },
      deals: { used: cards, limit: -1 },
      aiMessages: { used: 0, limit: -1 },
      webhooks: { used: 0, limit: -1 },
      apiCalls: { used: 0, limit: -1 },
      storage: { used: 0, limit: 100 },
    }
  }

  async changePlan(_companyId: string, _planId: string) {
    return { message: 'Plano atualizado' }
  }

  async cancelSubscription(_companyId: string) {
    return {
      id: 'sub-21go',
      status: 'canceled',
      cancelAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      canceledAt: new Date().toISOString(),
    }
  }
}
