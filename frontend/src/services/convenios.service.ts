import { api } from '../lib/api'
import type { Convenio, CreateConvenioRequest, UpdateConvenioRequest } from '../../../shared/types'

export const conveniosService = {
  async list(): Promise<Convenio[]> {
    const response = await api.get<Convenio[]>('/convenios')
    return response.data
  },

  async getById(id: string): Promise<Convenio> {
    const response = await api.get<Convenio>(`/convenios/${id}`)
    return response.data
  },

  async create(data: CreateConvenioRequest): Promise<Convenio> {
    const response = await api.post<Convenio>('/convenios', data)
    return response.data
  },

  async update(id: string, data: UpdateConvenioRequest): Promise<Convenio> {
    const response = await api.put<Convenio>(`/convenios/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/convenios/${id}`)
    return response.data
  },
}
