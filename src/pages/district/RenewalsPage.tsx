import { useRenewals } from '@/hooks/useDrivers'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/utils/formatters'
import type { Driver } from '@/types/driver.types'
import { RefreshCw } from 'lucide-react'

function getUrgency(expiry?: string): 'danger' | 'warning' | 'neutral' {
  if (!expiry) return 'neutral'
  const days = (new Date(expiry).getTime() - Date.now()) / 86400000
  if (days < 0) return 'danger'
  if (days < 30) return 'warning'
  return 'neutral'
}

export default function RenewalsPage() {
  const { data, isLoading, isError, refetch } = useRenewals()

  const columns: ColumnDef<Driver>[] = [
    { key: 'name', header: 'Name', cell: (r) => r.name, sortable: true, sortValue: (r) => r.name },
    { key: 'cardId', header: 'Card ID', cell: (r) => r.cardId ?? '—' },
    { key: 'expiry', header: 'Expiry', cell: (r) => formatDate(r.expiryDate ?? r.licenseExpiryDate), sortable: true },
    {
      key: 'urgency', header: 'Urgency',
      cell: (r) => {
        const v = getUrgency(r.expiryDate)
        const label = v === 'danger' ? 'Expired' : v === 'warning' ? 'Due Soon' : 'Upcoming'
        return <StatusBadge variant={v === 'neutral' ? 'info' : v} label={label} dot />
      },
    },
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge variant={statusToVariant(r.status)} label={r.status} /> },
  ]

  return (
    <div className="p-6">
      <PageHeader title="Renewals" subtitle="Drivers with expiring or expired memberships" />
      {isLoading && <SkeletonTable />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (
        <DataTable
          data={data ?? []}
          columns={columns}
          getRowKey={(r) => r.id}
          searchable
          emptyState={<EmptyState icon={RefreshCw} title="No renewals pending" description="All memberships are up to date." />}
        />
      )}
    </div>
  )
}
