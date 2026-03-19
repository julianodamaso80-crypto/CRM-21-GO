import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { vehiclesService, type ListVehiclesParams } from '../services/vehicles.service'
import type { CreateVehicleRequest, UpdateVehicleRequest } from '../../../shared/types'

export function useVehicles(params: ListVehiclesParams = {}) {
  return useQuery({
    queryKey: ['vehicles', params],
    queryFn: () => vehiclesService.list(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useVehiclesByAssociado(associadoId: string) {
  return useQuery({
    queryKey: ['vehicles', 'associado', associadoId],
    queryFn: () => vehiclesService.getByAssociado(associadoId),
    enabled: !!associadoId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVehicleRequest) => vehiclesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Veiculo cadastrado!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao cadastrar veiculo')
    },
  })
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehicleRequest }) =>
      vehiclesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Veiculo atualizado!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao atualizar veiculo')
    },
  })
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => vehiclesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Veiculo removido!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao remover veiculo')
    },
  })
}
