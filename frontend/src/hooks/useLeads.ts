import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { leadsService, type ListLeadsParams } from '../services/leads.service'
import type { CreateLeadRequest, UpdateLeadRequest } from '../../../shared/types'

export function useLeads(params: ListLeadsParams = {}) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => leadsService.list(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: () => leadsService.getById(id),
    enabled: !!id,
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLeadRequest) => leadsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar lead')
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadRequest }) =>
      leadsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] })
      toast.success('Lead atualizado!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar lead')
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => leadsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead excluido!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir lead')
    },
  })
}

export function useLeadStats() {
  return useQuery({
    queryKey: ['leads', 'stats'],
    queryFn: () => leadsService.getStats(),
    staleTime: 1000 * 60 * 5,
  })
}
