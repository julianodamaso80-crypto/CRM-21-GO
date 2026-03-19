import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { webhooksService } from '../services/webhooks.service'
import type { CreateWebhookRequest, UpdateWebhookRequest } from '../../../shared/types'

export function useWebhooks() {
  return useQuery({
    queryKey: ['webhooks'],
    queryFn: () => webhooksService.list(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useWebhookEvents() {
  return useQuery({
    queryKey: ['webhooks', 'events'],
    queryFn: () => webhooksService.getEvents(),
    staleTime: 1000 * 60 * 30,
  })
}

export function useCreateWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateWebhookRequest) => webhooksService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
      toast.success('Webhook criado!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar webhook')
    },
  })
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWebhookRequest }) =>
      webhooksService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
      toast.success('Webhook atualizado!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar webhook')
    },
  })
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => webhooksService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
      toast.success('Webhook excluido!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir webhook')
    },
  })
}
