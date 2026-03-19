import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { billingService } from '../services/billing.service'

export function usePlans() {
  return useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: () => billingService.getPlans(),
    staleTime: 1000 * 60 * 30,
  })
}

export function useSubscription() {
  return useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => billingService.getSubscription(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useInvoices() {
  return useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: () => billingService.getInvoices(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useUsage() {
  return useQuery({
    queryKey: ['billing', 'usage'],
    queryFn: () => billingService.getUsage(),
    staleTime: 1000 * 60 * 2,
  })
}

export function useChangePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (planId: string) => billingService.changePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] })
      toast.success('Plano alterado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao alterar plano')
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => billingService.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] })
      toast.success('Assinatura cancelada')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cancelar assinatura')
    },
  })
}
