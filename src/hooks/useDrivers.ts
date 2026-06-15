import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { driversService } from '../services/mock/drivers.service'
import type { DriverFilters, DriverStatus, CreateDriverDto } from '../types/driver.types'
import { toast } from 'sonner'

export const DRIVERS_QUERY_KEY = ['drivers'] as const

export function useDrivers(filters?: DriverFilters) {
  return useQuery({
    queryKey: [...DRIVERS_QUERY_KEY, filters],
    queryFn: () => driversService.getAll(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export function useDriver(id: string) {
  return useQuery({
    queryKey: [...DRIVERS_QUERY_KEY, id],
    queryFn: () => driversService.getById(id),
    enabled: !!id,
  })
}

export function useDriverRequests(filters?: DriverFilters) {
  return useQuery({
    queryKey: ['driver-requests', filters],
    queryFn: () => driversService.getRequests(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export function useRenewals() {
  return useQuery({
    queryKey: ['renewals'],
    queryFn: () => driversService.getRenewals(),
  })
}

export function useDriverStats() {
  return useQuery({
    queryKey: ['driver-stats'],
    queryFn: () => driversService.getStats(),
  })
}

export function useUpdateDriverStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: DriverStatus }) =>
      driversService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DRIVERS_QUERY_KEY })
      qc.invalidateQueries({ queryKey: ['driver-requests'] })
      toast.success('Driver status updated')
    },
    onError: (err: Error) => toast.error(`Failed: ${err.message}`),
  })
}

export function useCreateDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDriverDto) => driversService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DRIVERS_QUERY_KEY })
      toast.success('Application submitted successfully')
    },
    onError: (err: Error) => toast.error(`Failed: ${err.message}`),
  })
}

export function useVerifyDriver(id: string) {
  return useQuery({
    queryKey: ['verify', id],
    queryFn: () => driversService.verify(id),
    enabled: !!id,
    retry: false,
  })
}
