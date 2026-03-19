import { api } from '../lib/api'
import type { DashboardStats } from '../../../shared/types'

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/dashboard/stats')
    return response.data
  },
}
