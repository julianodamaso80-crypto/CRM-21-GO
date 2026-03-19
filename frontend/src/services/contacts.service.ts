import { api } from '../lib/api'
import type {
  Contact,
  ContactDetails,
  ContactsListResponse,
  ContactsStatsResponse,
  CreateContactRequest,
  UpdateContactRequest,
} from '../../../shared/types'

export interface ListContactsParams {
  page?: number
  limit?: number
  search?: string
  tags?: string[]
  status?: string
  origem?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'fullName'
  sortOrder?: 'asc' | 'desc'
}

export const contactsService = {
  /**
   * Lista contatos com paginação e filtros
   */
  async list(params: ListContactsParams = {}): Promise<ContactsListResponse> {
    const response = await api.get<ContactsListResponse>('/contacts', {
      params,
    })
    return response.data
  },

  /**
   * Busca contato por ID com dados relacionados
   */
  async getById(id: string): Promise<ContactDetails> {
    const response = await api.get<ContactDetails>(`/contacts/${id}`)
    return response.data
  },

  /**
   * Cria novo contato
   */
  async create(data: CreateContactRequest): Promise<Contact> {
    const response = await api.post<Contact>('/contacts', data)
    return response.data
  },

  /**
   * Atualiza contato existente
   */
  async update(id: string, data: UpdateContactRequest): Promise<Contact> {
    const response = await api.put<Contact>(`/contacts/${id}`, data)
    return response.data
  },

  /**
   * Deleta contato
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/contacts/${id}`)
    return response.data
  },

  /**
   * Busca tags únicas
   */
  async getTags(): Promise<string[]> {
    const response = await api.get<{ tags: string[] }>('/contacts/tags')
    return response.data.tags
  },

  /**
   * Busca estatísticas de contatos
   */
  async getStats(): Promise<ContactsStatsResponse> {
    const response = await api.get<ContactsStatsResponse>('/contacts/stats')
    return response.data
  },
}
