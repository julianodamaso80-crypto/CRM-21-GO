import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { npsService } from '../services/nps.service'

export function useNPSSurveys(params?: {
  patientId?: string
  doctorId?: string
  category?: string
  answered?: string
}) {
  return useQuery({
    queryKey: ['nps', params],
    queryFn: () => npsService.list(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useNPSStats() {
  return useQuery({
    queryKey: ['nps', 'stats'],
    queryFn: () => npsService.getStats(),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateNPSSurvey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: npsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nps'] })
      toast.success('Pesquisa registrada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar pesquisa')
    },
  })
}

export function useSendNPSBatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: npsService.sendBatch,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['nps'] })
      toast.success(`${data.sent} pesquisas enviadas com sucesso!`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao enviar pesquisas')
    },
  })
}

export function useDeleteNPSSurvey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: npsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nps'] })
      toast.success('Pesquisa removida')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover pesquisa')
    },
  })
}
