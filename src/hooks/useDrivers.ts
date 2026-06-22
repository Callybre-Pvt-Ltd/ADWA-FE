import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { driversService, verificationService, cardsService } from '../services'
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

export function useSuspendDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      driversService.suspend(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DRIVERS_QUERY_KEY })
      toast.success('Driver suspended')
    },
    onError: (err: Error) => toast.error(`Failed: ${err.message}`),
  })
}

export function useActivateDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => driversService.activate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DRIVERS_QUERY_KEY })
      toast.success('Driver activated')
    },
    onError: (err: Error) => toast.error(`Failed: ${err.message}`),
  })
}

export function useDriverCards() {
  return useQuery({
    queryKey: ['cards'],
    queryFn: () => cardsService.list(),
    staleTime: 1000 * 60 * 5,
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

export function useDriverActiveCard(driverId: string | null) {
  return useQuery({
    queryKey: [...DRIVERS_QUERY_KEY, 'active-card', driverId],
    queryFn: () => driversService.getActiveCard(driverId!),
    enabled: !!driverId,
    retry: false,
  })
}

export function useVerifyDriver(code: string) {
  return useQuery({
    queryKey: ['verify', code],
    queryFn: () => verificationService.verify(code),
    enabled: !!code,
    retry: false,
  })
}
