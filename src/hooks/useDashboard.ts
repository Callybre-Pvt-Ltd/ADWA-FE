import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services'

export const DISTRICT_DASHBOARD_KEY = ['dashboard', 'district'] as const
export const ADMIN_DASHBOARD_KEY = ['dashboard', 'admin'] as const

export function useDistrictDashboard() {
  return useQuery({
    queryKey: DISTRICT_DASHBOARD_KEY,
    queryFn: () => dashboardService.getDistrictStats(),
    staleTime: 1000 * 60 * 2,
  })
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ADMIN_DASHBOARD_KEY,
    queryFn: () => dashboardService.getAdminStats(),
    staleTime: 1000 * 60 * 2,
  })
}
