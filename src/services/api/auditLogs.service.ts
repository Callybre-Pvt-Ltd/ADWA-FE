import { apiClient, unwrapPaginated, unwrapResponse } from './client'
import { buildQueryParams, extractError, toCamelCase } from './mappers'
import type { APIResponse, PaginatedResult } from '@/types/api.types'
import type { AuditLog, AuditLogFilters } from '@/types/common.types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiAuditLog = Record<string, any>

function mapAuditLog(raw: ApiAuditLog): AuditLog {
  const item = toCamelCase<ApiAuditLog>(raw)
  const actor = item.actor as ApiAuditLog | undefined
  const actorRole = (actor?.role as string | undefined)?.toLowerCase() ?? 'system'
  const actorType = actorRole === 'super_admin' ? 'admin'
    : actorRole === 'district_incharge' ? 'district'
    : 'system'
  return {
    id: item.id,
    actor: actor?.fullName ?? (item.actorId ? item.actorId : 'System'),
    actorType,
    action: item.action,
    entity: item.resourceType,
    entityId: item.resourceId,
    timestamp: item.createdAt,
    details: item.newValues ? JSON.stringify(item.newValues) : undefined,
  }
}

export const auditLogsService = {
  async getAll(filters?: AuditLogFilters): Promise<PaginatedResult<AuditLog>> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiAuditLog[]>>(
        `/audit-logs${buildQueryParams({
          page: filters?.page ?? 1,
          size: filters?.size ?? 10,
          action: filters?.search,
        })}`,
      )
      const res = unwrapPaginated(data)
      let items = res.items.map(mapAuditLog)
      if (filters?.actorType && filters.actorType !== 'all') {
        items = items.filter((l) => l.actorType === filters.actorType)
      }
      return {
        ...res,
        items,
      }
    } catch (error) {
      throw await extractError(error)
    }
  },

  async getResourceHistory(resourceType: string, resourceId: string): Promise<AuditLog[]> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiAuditLog[]>>(
        `/audit-logs/resource/${resourceType}/${resourceId}`,
      )
      return (unwrapResponse(data) ?? []).map(mapAuditLog)
    } catch (error) {
      throw await extractError(error)
    }
  },

  async getUserActivity(userId: string): Promise<AuditLog[]> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiAuditLog[]>>(
        `/audit-logs/user/${userId}`,
      )
      return (unwrapResponse(data) ?? []).map(mapAuditLog)
    } catch (error) {
      throw await extractError(error)
    }
  },
}
