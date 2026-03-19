import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { doctorsService } from '../services/doctors.service'
import type { CreateDoctorRequest, UpdateDoctorRequest } from '../../../shared/types'

export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorsService.list(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useSpecialties() {
  return useQuery({
    queryKey: ['doctors', 'specialties'],
    queryFn: () => doctorsService.getSpecialties(),
    staleTime: 1000 * 60 * 60,
  })
}

export function useCreateDoctor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDoctorRequest) => doctorsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      toast.success('Medico cadastrado!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cadastrar medico')
    },
  })
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDoctorRequest }) =>
      doctorsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      toast.success('Medico atualizado!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar medico')
    },
  })
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => doctorsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      toast.success('Medico removido!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover medico')
    },
  })
}
