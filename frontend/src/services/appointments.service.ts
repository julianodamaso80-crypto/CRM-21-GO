import { api } from '../lib/api'
import type { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest, AppointmentStatsResponse, DoctorAvailability } from '../../../shared/types'

export const appointmentsService = {
  async list(params?: {
    date?: string
    dateFrom?: string
    dateTo?: string
    doctorId?: string
    patientId?: string
    status?: string
  }): Promise<Appointment[]> {
    const response = await api.get<Appointment[]>('/appointments', { params })
    return response.data
  },

  async getById(id: string): Promise<Appointment> {
    const response = await api.get<Appointment>(`/appointments/${id}`)
    return response.data
  },

  async create(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await api.post<Appointment>('/appointments', data)
    return response.data
  },

  async update(id: string, data: UpdateAppointmentRequest): Promise<Appointment> {
    const response = await api.put<Appointment>(`/appointments/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/appointments/${id}`)
    return response.data
  },

  async getStats(): Promise<AppointmentStatsResponse> {
    const response = await api.get<AppointmentStatsResponse>('/appointments/stats')
    return response.data
  },

  async getTypes(): Promise<Record<string, string>> {
    const response = await api.get<Record<string, string>>('/appointments/types')
    return response.data
  },

  async getAvailability(doctorId: string, date: string): Promise<DoctorAvailability> {
    const response = await api.get<DoctorAvailability>('/appointments/availability', {
      params: { doctorId, date },
    })
    return response.data
  },
}
