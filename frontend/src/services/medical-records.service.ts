import { api } from '../lib/api'
import type { MedicalRecord, CreateMedicalRecordRequest, UpdateMedicalRecordRequest, PatientTimeline } from '../../../shared/types'

export const medicalRecordsService = {
  async list(params?: {
    patientId?: string
    doctorId?: string
    type?: string
  }): Promise<MedicalRecord[]> {
    const response = await api.get<MedicalRecord[]>('/medical-records', { params })
    return response.data
  },

  async getById(id: string): Promise<MedicalRecord> {
    const response = await api.get<MedicalRecord>(`/medical-records/${id}`)
    return response.data
  },

  async create(data: CreateMedicalRecordRequest): Promise<MedicalRecord> {
    const response = await api.post<MedicalRecord>('/medical-records', data)
    return response.data
  },

  async update(id: string, data: UpdateMedicalRecordRequest): Promise<MedicalRecord> {
    const response = await api.put<MedicalRecord>(`/medical-records/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/medical-records/${id}`)
    return response.data
  },

  async getTypes(): Promise<Record<string, string>> {
    const response = await api.get<Record<string, string>>('/medical-records/types')
    return response.data
  },

  async getPatientTimeline(patientId: string): Promise<PatientTimeline> {
    const response = await api.get<PatientTimeline>(`/patients/${patientId}/timeline`)
    return response.data
  },
}
