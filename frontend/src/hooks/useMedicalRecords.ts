import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { medicalRecordsService } from '../services/medical-records.service'

export function useMedicalRecords(params?: {
  patientId?: string
  doctorId?: string
  type?: string
}) {
  return useQuery({
    queryKey: ['medical-records', params],
    queryFn: () => medicalRecordsService.list(params),
    enabled: !params?.patientId || !!params.patientId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useMedicalRecord(id: string) {
  return useQuery({
    queryKey: ['medical-records', id],
    queryFn: () => medicalRecordsService.getById(id),
    enabled: !!id,
  })
}

export function useMedicalRecordTypes() {
  return useQuery({
    queryKey: ['medical-records', 'types'],
    queryFn: () => medicalRecordsService.getTypes(),
    staleTime: 1000 * 60 * 30,
  })
}

export function usePatientTimeline(patientId: string) {
  return useQuery({
    queryKey: ['patient-timeline', patientId],
    queryFn: () => medicalRecordsService.getPatientTimeline(patientId),
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: medicalRecordsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] })
      queryClient.invalidateQueries({ queryKey: ['patient-timeline'] })
      toast.success('Prontuario salvo com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao salvar prontuario')
    },
  })
}

export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      medicalRecordsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] })
      queryClient.invalidateQueries({ queryKey: ['patient-timeline'] })
      toast.success('Prontuario atualizado!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar prontuario')
    },
  })
}

export function useDeleteMedicalRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: medicalRecordsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] })
      queryClient.invalidateQueries({ queryKey: ['patient-timeline'] })
      toast.success('Registro removido')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover registro')
    },
  })
}
