import { api } from '../lib/api'
import type { Automation, CreateAutomationRequest, UpdateAutomationRequest } from '../../../shared/types'

export interface AutomationTrigger {
  type: string
  label: string
  events: string[]
}

export interface AutomationAction {
  type: string
  label: string
}

export const automationsService = {
  async list(): Promise<Automation[]> {
    const response = await api.get<Automation[]>('/automations')
    return response.data
  },

  async getById(id: string): Promise<Automation> {
    const response = await api.get<Automation>(`/automations/${id}`)
    return response.data
  },

  async create(data: CreateAutomationRequest): Promise<Automation> {
    const response = await api.post<Automation>('/automations', data)
    return response.data
  },

  async update(id: string, data: UpdateAutomationRequest): Promise<Automation> {
    const response = await api.put<Automation>(`/automations/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/automations/${id}`)
    return response.data
  },

  async getTriggers(): Promise<AutomationTrigger[]> {
    const response = await api.get<AutomationTrigger[]>('/automations/triggers')
    return response.data
  },

  async getActions(): Promise<AutomationAction[]> {
    const response = await api.get<AutomationAction[]>('/automations/actions')
    return response.data
  },
}
