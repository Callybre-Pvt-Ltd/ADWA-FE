import { useQuery } from '@tanstack/react-query'
import { teamService } from '../services'

export function useTeam() {
  return useQuery({
    queryKey: ['team'],
    queryFn: () => teamService.getTeam(),
    staleTime: 1000 * 60 * 10,
  })
}
export function useMonthlyRegistrations() {
  return useQuery({
    queryKey: ['monthly-registrations'],
    queryFn: () => teamService.getMonthlyRegistrations(),
  })
}

export function useDistrictRegistrations() {
  return useQuery({
    queryKey: ['district-registrations'],
    queryFn: () => teamService.getDistrictRegistrations(),
  })
}

export function usePaymentBreakdown() {
  return useQuery({
    queryKey: ['payment-breakdown'],
    queryFn: () => teamService.getPaymentBreakdown(),
  })
}

export function useActivities() {
  return useQuery({
    queryKey: ['activities'],
    queryFn: () => teamService.getActivities(),
  })
}
