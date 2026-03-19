import { api } from '../lib/api'
import type { NPSSurvey, NPSStats, CreateNPSSurveyRequest, SendNPSBatchRequest } from '../../../shared/types'

export const npsService = {
  async list(params?: {
    patientId?: string
    doctorId?: string
    category?: string
    answered?: string
  }): Promise<NPSSurvey[]> {
    const response = await api.get<NPSSurvey[]>('/nps', { params })
    return response.data
  },

  async getStats(): Promise<NPSStats> {
    const response = await api.get<NPSStats>('/nps/stats')
    return response.data
  },

  async create(data: CreateNPSSurveyRequest): Promise<NPSSurvey> {
    const response = await api.post<NPSSurvey>('/nps', data)
    return response.data
  },

  async sendBatch(data: SendNPSBatchRequest): Promise<{ sent: number; surveys: NPSSurvey[] }> {
    const response = await api.post<{ sent: number; surveys: NPSSurvey[] }>('/nps/send-batch', data)
    return response.data
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/nps/${id}`)
    return response.data
  },
}
