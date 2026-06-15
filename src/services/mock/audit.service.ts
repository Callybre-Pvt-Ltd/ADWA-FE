import { mockAuditLogs } from '../../mock-data/audit.mock'
import { delay } from '../../utils/formatters'
import type { AuditLog, AuditLogFilters } from '../../types/common.types'

const SIMULATED_DELAY = 800

export const auditService = {
  async getAll(filters?: AuditLogFilters): Promise<AuditLog[]> {
    await delay(SIMULATED_DELAY)
    let result = [...mockAuditLogs]
    if (filters?.actorType && filters.actorType !== 'all') {
      result = result.filter((l) => l.actorType === filters.actorType)
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (l) =>
          l.actor.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.entity.toLowerCase().includes(q),
      )
    }
    return result.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
  },
}
