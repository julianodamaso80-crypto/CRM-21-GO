import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsService, type CreateProjectRequest } from '../services/projects.service'
import { toast } from 'sonner'

export function useProjects(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsService.list(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Tarefa criada!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao criar tarefa')
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProjectRequest> }) =>
      projectsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao atualizar tarefa')
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Tarefa removida!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao remover tarefa')
    },
  })
}
