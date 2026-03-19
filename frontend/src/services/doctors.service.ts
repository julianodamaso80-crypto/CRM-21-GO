import { api } from '../lib/api'
import type { Doctor, CreateDoctorRequest, UpdateDoctorRequest } from '../../../shared/types'

export const doctorsService = {
  async list(): Promise<Doctor[]> {
    const response = await api.get<Doctor[]>('/doctors')
    return response.data
  },

  async getById(id: string): Promise<Doctor> {
    const response = await api.get<Doctor>(`/doctors/${id}`)
    return response.data
  },

  async create(data: CreateDoctorRequest): Promise<Doctor> {
    const response = await api.post<Doctor>('/doctors', data)
    return response.data
  },

  async update(id: string, data: UpdateDoctorRequest): Promise<Doctor> {
    const response = await api.put<Doctor>(`/doctors/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/doctors/${id}`)
    return response.data
  },

  async getSpecialties(): Promise<Record<string, string>> {
    const response = await api.get<Record<string, string>>('/doctors/specialties')
    return response.data
  },
}
