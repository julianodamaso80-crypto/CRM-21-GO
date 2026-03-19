import { api } from '../lib/api'
import type { Webhook, CreateWebhookRequest, UpdateWebhookRequest } from '../../../shared/types'

export const webhooksService = {
  async list(): Promise<Webhook[]> {
    const response = await api.get<Webhook[]>('/webhooks')
    return response.data
  },

  async getById(id: string): Promise<Webhook> {
    const response = await api.get<Webhook>(`/webhooks/${id}`)
    return response.data
  },

  async create(data: CreateWebhookRequest): Promise<Webhook> {
    const response = await api.post<Webhook>('/webhooks', data)
    return response.data
  },

  async update(id: string, data: UpdateWebhookRequest): Promise<Webhook> {
    const response = await api.put<Webhook>(`/webhooks/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/webhooks/${id}`)
    return response.data
  },

  async getEvents(): Promise<string[]> {
    const response = await api.get<string[]>('/webhooks/events')
    return response.data
  },
}
