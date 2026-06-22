import type { ActivityItem, ChartDataPoint, Statistic, TeamMember, Testimonial } from '@/types/common.types'
import { auditLogsService } from './auditLogs.service'
import { dashboardService } from './dashboard.service'
import { paymentsService } from './payments.service'

export const teamService = {
  async getTeam(): Promise<TeamMember[]> {
    return []
  },

  async getStatistics(): Promise<Statistic[]> {
    return []
  },

  async getTestimonials(): Promise<Testimonial[]> {
    return []
  },

  async getMonthlyRegistrations(): Promise<ChartDataPoint[]> {
    try {
      const stats = await dashboardService.getDistrictStats()
      return stats.monthlyApplications ?? []
    } catch {
      return []
    }
  },

  async getDistrictRegistrations(): Promise<ChartDataPoint[]> {
    try {
      const stats = await dashboardService.getAdminStats()
      return stats.districtWiseDrivers ?? []
    } catch {
      return []
    }
  },

  async getPaymentBreakdown(): Promise<ChartDataPoint[]> {
    try {
      const stats = await paymentsService.getStats()
      return [
        { label: 'Collected', value: stats.collected },
        { label: 'Confirmed', value: stats.confirmed },
        { label: 'Pending', value: stats.pending },
      ].filter((row) => row.value > 0)
    } catch {
      return []
    }
  },

  async getActivities(): Promise<ActivityItem[]> {
    try {
      const logs = await auditLogsService.getAll()
      return logs.slice(0, 10).map((log) => ({
        id: log.id,
        message: `${log.action} · ${log.entity}`,
        timestamp: log.timestamp,
        type: 'info' as const,
      }))
    } catch {
      return []
    }
  },
}
