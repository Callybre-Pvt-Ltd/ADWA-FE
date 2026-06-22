import { apiClient, unwrapPaginated, unwrapResponse } from './client'
import { buildQueryParams, extractError, toCamelCase } from './mappers'
import type { APIResponse } from '@/types/api.types'
import type { AuditLog, AuditLogFilters } from '@/types/common.types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiAuditLog = Record<string, any>

function mapAuditLog(raw: ApiAuditLog): AuditLog {
  const item = toCamelCase<ApiAuditLog>(raw)
  return {
    id: item.id,
    actor: item.actorId ?? 'system',
    actorType: 'system',
    action: item.action,
    entity: item.resourceType,
    entityId: item.resourceId,
    timestamp: item.createdAt,
    details: item.newValues ? JSON.stringify(item.newValues) : undefined,
  }
}

export const auditLogsService = {
  async getAll(filters?: AuditLogFilters): Promise<AuditLog[]> {
    try {
      const { data } = await apiClient.get<APIResponse<ApiAuditLog[]>>(
        `/audit-logs${buildQueryParams({
          page: 1,
          size: 100,
          action: filters?.search,
        })}`,
      )
      let items = unwrapPaginated(data).items.map(mapAuditLog)
      if (filters?.actorType && filters.actorType !== 'all') {
        items = items.filter((l) => l.actorType === filters.actorType)
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        items = items.filter(
          (l) =>
            l.action.toLowerCase().includes(q) ||
            l.entity.toLowerCase().includes(q) ||
            l.actor.toLowerCase().includes(q),
        )
      }
      return items
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
