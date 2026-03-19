import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { automationsService } from '../services/automations.service'
import type { CreateAutomationRequest, UpdateAutomationRequest } from '../../../shared/types'

export function useAutomations() {
  return useQuery({
    queryKey: ['automations'],
    queryFn: () => automationsService.list(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useAutomationTriggers() {
  return useQuery({
    queryKey: ['automations', 'triggers'],
    queryFn: () => automationsService.getTriggers(),
    staleTime: 1000 * 60 * 30,
  })
}

export function useAutomationActions() {
  return useQuery({
    queryKey: ['automations', 'actions'],
    queryFn: () => automationsService.getActions(),
    staleTime: 1000 * 60 * 30,
  })
}

export function useCreateAutomation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAutomationRequest) => automationsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] })
      toast.success('Automacao criada!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar automacao')
    },
  })
}

export function useUpdateAutomation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAutomationRequest }) =>
      automationsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] })
      toast.success('Automacao atualizada!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar automacao')
    },
  })
}

export function useDeleteAutomation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => automationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] })
      toast.success('Automacao excluida!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir automacao')
    },
  })
}
