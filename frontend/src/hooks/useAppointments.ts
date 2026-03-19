import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { appointmentsService } from '../services/appointments.service'

export function useAppointments(params?: {
  date?: string
  dateFrom?: string
  dateTo?: string
  doctorId?: string
  patientId?: string
  status?: string
}) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => appointmentsService.list(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useAppointmentStats() {
  return useQuery({
    queryKey: ['appointments', 'stats'],
    queryFn: () => appointmentsService.getStats(),
    staleTime: 1000 * 60 * 2,
  })
}

export function useAppointmentTypes() {
  return useQuery({
    queryKey: ['appointments', 'types'],
    queryFn: () => appointmentsService.getTypes(),
    staleTime: 1000 * 60 * 30,
  })
}

export function useDoctorAvailability(doctorId: string, date: string) {
  return useQuery({
    queryKey: ['appointments', 'availability', doctorId, date],
    queryFn: () => appointmentsService.getAvailability(doctorId, date),
    enabled: !!doctorId && !!date,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: appointmentsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Consulta agendada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao agendar consulta')
    },
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      appointmentsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Consulta atualizada!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar consulta')
    },
  })
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: appointmentsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Consulta removida')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover consulta')
    },
  })
}
