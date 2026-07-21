import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { driverRequestsService } from '../services'
import type { DriverFilters } from '../types/driver.types'
import { buildDriverRequestFormData, type DriverRequestFormData } from '../utils/validators'
import { toast } from 'sonner'

export const DRIVER_REQUESTS_QUERY_KEY = ['driver-requests'] as const

export function useDriverRequestList(filters?: DriverFilters) {
  return useQuery({
    queryKey: [...DRIVER_REQUESTS_QUERY_KEY, 'list', filters],
    queryFn: () => driverRequestsService.list(filters),
    staleTime: 1000 * 60 * 2,
  })
}

export function useDriverRequest(id: string | null) {
  return useQuery({
    queryKey: [...DRIVER_REQUESTS_QUERY_KEY, 'detail', id],
    queryFn: () => driverRequestsService.get(id!),
    enabled: !!id,
    staleTime: 0,
  })
}

export function useForwardedApplications(filters?: DriverFilters) {
  return useQuery({
    queryKey: [...DRIVER_REQUESTS_QUERY_KEY, 'forwarded', filters],
    queryFn: () =>
      driverRequestsService.list({ ...filters, status: 'FORWARDED_TO_ADMIN' }),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useSubmitDriverRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: DriverRequestFormData) =>
      driverRequestsService.submit(buildDriverRequestFormData(data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DRIVER_REQUESTS_QUERY_KEY })
    },
    onError: (err: Error) => toast.error(`Submission failed: ${err.message}`),
  })
}

export function useTrackApplication(ref: string, mobile: string, enabled: boolean) {
  return useQuery({
    queryKey: [...DRIVER_REQUESTS_QUERY_KEY, 'track', ref, mobile],
    queryFn: () => driverRequestsService.track(ref, mobile),
    enabled,
    staleTime: 0,
  })
}

export function useRecoverReference() {
  return useMutation({
    mutationFn: ({ mobile, dob }: { mobile: string; dob: string }) =>
      driverRequestsService.recoverReference(mobile, dob),
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useForwardApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      verificationRemarks,
      paymentProof,
      diNotes,
    }: {
      id: string
      verificationRemarks?: string
      paymentProof?: File
      diNotes?: string
    }) => driverRequestsService.forward(id, verificationRemarks, paymentProof, diNotes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DRIVER_REQUESTS_QUERY_KEY })
      toast.success('Application forwarded to admin')
    },
    onError: (err: Error) => toast.error(`Forward failed: ${err.message}`),
  })
}

export function useApproveApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => driverRequestsService.approve(id),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: DRIVER_REQUESTS_QUERY_KEY })
      toast.success(`Approved — Driver ID: ${result.memberNumber}`)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useRejectApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      driverRequestsService.reject(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DRIVER_REQUESTS_QUERY_KEY })
      toast.success('Application rejected')
    },
    onError: (err: Error) => toast.error(`Failed: ${err.message}`),
  })
  }
    