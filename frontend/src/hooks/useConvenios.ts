import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { conveniosService } from '../services/convenios.service'
import type { CreateConvenioRequest, UpdateConvenioRequest } from '../../../shared/types'

export function useConvenios() {
  return useQuery({
    queryKey: ['convenios'],
    queryFn: () => conveniosService.list(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateConvenio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateConvenioRequest) => conveniosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenios'] })
      toast.success('Convenio cadastrado!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cadastrar convenio')
    },
  })
}

export function useUpdateConvenio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConvenioRequest }) =>
      conveniosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenios'] })
      toast.success('Convenio atualizado!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar convenio')
    },
  })
}

export function useDeleteConvenio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => conveniosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenios'] })
      toast.success('Convenio removido!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover convenio')
    },
  })
}
