import { api } from '../lib/api'
import type {
  Associado,
  AssociadoDetails,
  AssociadosListResponse,
  AssociadosStatsResponse,
  CreateAssociadoRequest,
  UpdateAssociadoRequest,
} from '../../../shared/types'

export interface ListAssociadosParams {
  page?: number
  limit?: number
  search?: string
  tags?: string[]
  status?: string
  origem?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'fullName'
  sortOrder?: 'asc' | 'desc'
}

export const associadosService = {
  async list(params: ListAssociadosParams = {}): Promise<AssociadosListResponse> {
    const response = await api.get<AssociadosListResponse>('/associados', {
      params,
    })
    return response.data
  },

  async getById(id: string): Promise<AssociadoDetails> {
    const response = await api.get<AssociadoDetails>(`/associados/${id}`)
    return response.data
  },

  async create(data: CreateAssociadoRequest): Promise<Associado> {
    const response = await api.post<Associado>('/associados', data)
    return response.data
  },

  async update(id: string, data: UpdateAssociadoRequest): Promise<Associado> {
    const response = await api.put<Associado>(`/associados/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/associados/${id}`)
    return response.data
  },

  async getTags(): Promise<string[]> {
    const response = await api.get<{ tags: string[] }>('/associados/tags')
    return response.data.tags
  },

  async getStats(): Promise<AssociadosStatsResponse> {
    const response = await api.get<AssociadosStatsResponse>('/associados/stats')
    return response.data
  },
}
