import { apiClient, unwrapResponse } from './client'
import { extractError } from './mappers'
import type { APIResponse } from '@/types/api.types'
import type { DashboardStats } from '@/types/common.types'
import type { ChartDataPoint } from '@/types/common.types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DashboardPayload = Record<string, any>

function mapMonthly(data: DashboardPayload[] | undefined): ChartDataPoint[] {
  return (data ?? []).map((row) => ({
    label: row.month ?? '',
    value: row.count ?? 0,
  }))
}

export const dashboardService = {
  async getDistrictStats(): Promise<DashboardStats & { monthlyApplications?: ChartDataPoint[] }> {
    try {
      const { data } = await apiClient.get<APIResponse<DashboardPayload>>('/dashboard/district')
      const stats = unwrapResponse(data) ?? {}
      return {
        totalDrivers: stats.total_drivers ?? stats.totalDrivers ?? 0,
        pendingRequests: stats.pending_applications ?? stats.pendingApplications ?? 0,
        paymentPending: stats.forwarded_to_admin ?? stats.forwardedToAdmin ?? 0,
        idsGenerated: stats.approved_applications ?? stats.approvedApplications ?? 0,
        monthlyApplications: mapMonthly(stats.monthly_applications ?? stats.monthlyApplications),
      }
    } catch (error) {
      throw await extractError(error)
    }
  },

  async getAdminStats(): Promise<
    DashboardStats & {
      monthlyRegistrations?: ChartDataPoint[]
      districtWiseDrivers?: ChartDataPoint[]
    }
  > {
    try {
      const { data } = await apiClient.get<APIResponse<DashboardPayload>>('/dashboard/admin')
      const stats = unwrapResponse(data) ?? {}
      const districtWise = (stats.district_wise_drivers ?? stats.districtWiseDrivers ?? []) as DashboardPayload[]
      return {
        totalDrivers: stats.total_drivers ?? stats.totalDrivers ?? 0,
        pendingRequests: stats.pending_requests ?? stats.pendingRequests ?? 0,
        paymentPending: stats.pending_requests ?? stats.pendingRequests ?? 0,
        idsGenerated: stats.active_drivers ?? stats.activeDrivers ?? 0,
        totalDistricts: stats.total_districts ?? stats.totalDistricts ?? 0,
        pendingPayments: stats.pending_requests ?? stats.pendingRequests ?? 0,
        monthlyRegistrations: mapMonthly(stats.monthly_registrations ?? stats.monthlyRegistrations),
        districtWiseDrivers: districtWise.map((row) => ({
          label: row.district ?? '',
          value: row.count ?? 0,
        })),
      }
    } catch (error) {
      throw await extractError(error)
    }
  },
}
