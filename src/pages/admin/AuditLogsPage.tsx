import { useState } from 'react'
import { useAuditLogs } from '@/hooks/useAuditLogs'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { ErrorState } from '@/components/shared/ErrorState'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDateTime } from '@/utils/formatters'
import type { AuditLog } from '@/types/common.types'

export default function AuditLogsPage() {
  const [actorType, setActorType] = useState<string>('all')
  const { data, isLoading, isError, refetch } = useAuditLogs({ actorType: actorType as 'all' })

  const columns: ColumnDef<AuditLog>[] = [
    { key: 'actor', header: 'Actor', cell: (r) => r.actor, sortable: true, sortValue: (r) => r.actor },
    { key: 'type', header: 'Type', cell: (r) => <StatusBadge variant={r.actorType === 'admin' ? 'primary' : r.actorType === 'system' ? 'neutral' : 'info'} label={r.actorType} /> },
    { key: 'action', header: 'Action', cell: (r) => r.action },
    { key: 'entity', header: 'Entity', cell: (r) => `${r.entity} (${r.entityId})` },
    { key: 'time', header: 'Timestamp', cell: (r) => formatDateTime(r.timestamp), sortable: true, sortValue: (r) => r.timestamp },
  ]

  return (
    <div className="p-6">
      <PageHeader
        title="Audit Logs"
        subtitle="System activity and change history"
        action={
          <Select value={actorType} onValueChange={setActorType}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actors</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="district">District</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      {isLoading && <SkeletonTable />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (
        <DataTable data={data ?? []} columns={columns} getRowKey={(r) => r.id} searchable searchPlaceholder="Search logs..." />
      )}
    </div>
  )
}
