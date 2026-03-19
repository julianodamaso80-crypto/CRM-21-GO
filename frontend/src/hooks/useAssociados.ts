import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { associadosService, type ListAssociadosParams } from '../services/associados.service'
import type { CreateAssociadoRequest, UpdateAssociadoRequest } from '../../../shared/types'

export function useAssociados(params: ListAssociadosParams = {}) {
  return useQuery({
    queryKey: ['associados', params],
    queryFn: () => associadosService.list(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useAssociado(id: string) {
  return useQuery({
    queryKey: ['associados', id],
    queryFn: () => associadosService.getById(id),
    enabled: !!id,
  })
}

export function useCreateAssociado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAssociadoRequest) => associadosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associados'] })
      toast.success('Associado criado com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao criar associado'
      toast.error(message)
    },
  })
}

export function useUpdateAssociado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssociadoRequest }) =>
      associadosService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['associados'] })
      queryClient.invalidateQueries({ queryKey: ['associados', variables.id] })
      toast.success('Associado atualizado com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao atualizar associado'
      toast.error(message)
    },
  })
}

export function useDeleteAssociado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => associadosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associados'] })
      toast.success('Associado excluido com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao excluir associado'
      toast.error(message)
    },
  })
}

export function useAssociadoTags() {
  return useQuery({
    queryKey: ['associados', 'tags'],
    queryFn: () => associadosService.getTags(),
    staleTime: 1000 * 60 * 10,
  })
}

export function useAssociadoStats() {
  return useQuery({
    queryKey: ['associados', 'stats'],
    queryFn: () => associadosService.getStats(),
    staleTime: 1000 * 60 * 5,
  })
}
