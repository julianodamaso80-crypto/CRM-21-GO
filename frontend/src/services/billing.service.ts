import { api } from '../lib/api'
import type { Plan, Subscription } from '../../../shared/types'

export interface Invoice {
  id: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  paidAt?: string
  periodStart: string
  periodEnd: string
}

export interface UsageItem {
  used: number
  limit: number
}

export interface Usage {
  users: UsageItem
  leads: UsageItem
  deals: UsageItem
  aiMessages: UsageItem
  webhooks: UsageItem
  apiCalls: UsageItem
  storage: UsageItem
}

export const billingService = {
  async getPlans(): Promise<Plan[]> {
    const response = await api.get<Plan[]>('/billing/plans')
    return response.data
  },

  async getSubscription(): Promise<Subscription> {
    const response = await api.get<Subscription>('/billing/subscription')
    return response.data
  },

  async getInvoices(): Promise<Invoice[]> {
    const response = await api.get<Invoice[]>('/billing/invoices')
    return response.data
  },

  async getUsage(): Promise<Usage> {
    const response = await api.get<Usage>('/billing/usage')
    return response.data
  },

  async changePlan(planId: string): Promise<Subscription> {
    const response = await api.post<Subscription>('/billing/change-plan', { planId })
    return response.data
  },

  async cancelSubscription(): Promise<Subscription> {
    const response = await api.post<Subscription>('/billing/cancel')
    return response.data
  },
}
