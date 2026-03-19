import { api } from '../lib/api'
import type {
  Lead,
  CreateLeadRequest,
  UpdateLeadRequest,
  LeadsListResponse,
  LeadStatsResponse,
} from '../../../shared/types'

export interface ListLeadsParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  source?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'score'
  sortOrder?: 'asc' | 'desc'
}

export const leadsService = {
  async list(params: ListLeadsParams = {}): Promise<LeadsListResponse> {
    const response = await api.get<LeadsListResponse>('/leads', { params })
    return response.data
  },

  async getById(id: string): Promise<Lead> {
    const response = await api.get<Lead>(`/leads/${id}`)
    return response.data
  },

  async create(data: CreateLeadRequest): Promise<Lead> {
    const response = await api.post<Lead>('/leads', data)
    return response.data
  },

  async update(id: string, data: UpdateLeadRequest): Promise<Lead> {
    const response = await api.put<Lead>(`/leads/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/leads/${id}`)
    return response.data
  },

  async getStats(): Promise<LeadStatsResponse> {
    const response = await api.get<LeadStatsResponse>('/leads/stats')
    return response.data
  },
}
