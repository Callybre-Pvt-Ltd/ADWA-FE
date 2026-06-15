import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentsService } from '../services/mock/payments.service'
import type { PaymentFilters, PaymentStatus } from '../types/payment.types'
import { toast } from 'sonner'

export const PAYMENTS_QUERY_KEY = ['payments'] as const

export function usePayments(filters?: PaymentFilters) {
  return useQuery({
    queryKey: [...PAYMENTS_QUERY_KEY, filters],
    queryFn: () => paymentsService.getAll(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export function usePaymentStats() {
  return useQuery({
    queryKey: ['payment-stats'],
    queryFn: () => paymentsService.getStats(),
  })
}

export function useUpdatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PaymentStatus }) =>
      paymentsService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY })
      toast.success('Payment updated successfully')
    },
    onError: (err: Error) => toast.error(`Failed: ${err.message}`),
  })
}
