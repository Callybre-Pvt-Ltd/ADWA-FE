import { useQuery } from '@tanstack/react-query'
import { auditService } from '../services/mock/audit.service'
import type { AuditLogFilters } from '../types/common.types'

export const AUDIT_QUERY_KEY = ['audit-logs'] as const

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: [...AUDIT_QUERY_KEY, filters],
    queryFn: () => auditService.getAll(filters),
    staleTime: 1000 * 60 * 5,
  })
}
