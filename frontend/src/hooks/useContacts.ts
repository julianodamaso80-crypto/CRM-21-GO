import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { contactsService, type ListContactsParams } from '../services/contacts.service'
import type { CreateContactRequest, UpdateContactRequest } from '../../../shared/types'

/**
 * Hook para listar contatos com paginação e filtros
 */
export function useContacts(params: ListContactsParams = {}) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => contactsService.list(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

/**
 * Hook para buscar contato por ID
 */
export function useContact(id: string) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => contactsService.getById(id),
    enabled: !!id,
  })
}

/**
 * Hook para criar novo contato
 */
export function useCreateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateContactRequest) => contactsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Associado criado com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao criar associado'
      toast.error(message)
    },
  })
}

/**
 * Hook para atualizar contato existente
 */
export function useUpdateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContactRequest }) =>
      contactsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['contacts', variables.id] })
      toast.success('Associado atualizado com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao atualizar associado'
      toast.error(message)
    },
  })
}

/**
 * Hook para deletar contato
 */
export function useDeleteContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => contactsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Associado excluido com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao excluir associado'
      toast.error(message)
    },
  })
}

/**
 * Hook para buscar tags disponíveis
 */
export function useContactTags() {
  return useQuery({
    queryKey: ['contacts', 'tags'],
    queryFn: () => contactsService.getTags(),
    staleTime: 1000 * 60 * 10, // 10 minutos
  })
}

/**
 * Hook para buscar estatísticas de contatos
 */
export function useContactStats() {
  return useQuery({
    queryKey: ['contacts', 'stats'],
    queryFn: () => contactsService.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}
