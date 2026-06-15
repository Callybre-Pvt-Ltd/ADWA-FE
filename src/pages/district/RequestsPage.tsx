import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDriverRequests, useUpdateDriverStatus } from '@/hooks/useDrivers'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import { AppDrawer } from '@/components/shared/AppDrawer'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils/formatters'
import type { DriverRequest } from '@/types/driver.types'
import { ClipboardList } from 'lucide-react'

export default function RequestsPage() {
  const { t } = useTranslation('dashboard')
  const [status, setStatus] = useState<string>('all')
  const [selected, setSelected] = useState<DriverRequest | null>(null)
  const [confirmAction, setConfirmAction] = useState<'approved' | 'rejected' | null>(null)
  const { data, isLoading, isError, refetch } = useDriverRequests({ status: status as 'all' })
  const updateStatus = useUpdateDriverStatus()

  const columns: ColumnDef<DriverRequest>[] = [
    { key: 'name', header: 'Name', cell: (r) => r.name, sortable: true, sortValue: (r) => r.name },
    { key: 'type', header: 'Type', cell: (r) => r.requestType },
    { key: 'district', header: 'District', cell: (r) => r.district },
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge variant={statusToVariant(r.status)} label={r.status} /> },
    { key: 'date', header: 'Submitted', cell: (r) => formatDate(r.submittedAt), sortable: true, sortValue: (r) => r.submittedAt },
  ]

  const handleConfirm = () => {
    if (!selected || !confirmAction) return
    updateStatus.mutate({ id: selected.id, status: confirmAction }, {
      onSuccess: () => { setConfirmAction(null); setSelected(null) },
    })
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Driver Requests"
        subtitle="Review and approve new applications"
        action={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      {isLoading && <SkeletonTable />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (
        <DataTable
          data={data ?? []}
          columns={columns}
          getRowKey={(r) => r.id}
          searchable
          onRowClick={setSelected}
          emptyState={<EmptyState icon={ClipboardList} title="No requests found" />}
        />
      )}
      <AppDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
        description={`Request type: ${selected?.requestType}`}
        footer={selected?.status === 'pending' && (
          <div className="flex gap-2">
            <Button variant="destructive" className="flex-1" onClick={() => setConfirmAction('rejected')}>{t('dashboard.reject')}</Button>
            <Button className="flex-1" onClick={() => setConfirmAction('approved')}>{t('dashboard.approve')}</Button>
          </div>
        )}
      >
        {selected && (
          <dl className="space-y-3 text-sm">
            {[
              ['Mobile', selected.mobile], ['District', selected.district],
              ['License', selected.licenseNumber], ['Blood Group', selected.bloodGroup],
              ['Address', selected.address],
            ].map(([k, v]) => (
              <div key={k}><dt className="text-neutral-500">{k}</dt><dd className="font-medium">{v}</dd></div>
            ))}
          </dl>
        )}
      </AppDrawer>
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
        title={confirmAction === 'approved' ? 'Approve Request?' : 'Reject Request?'}
        description={`This will ${confirmAction} the application for ${selected?.name}.`}
        confirmLabel={confirmAction === 'approved' ? t('dashboard.approve') : t('dashboard.reject')}
        variant={confirmAction === 'rejected' ? 'destructive' : 'default'}
        onConfirm={handleConfirm}
        loading={updateStatus.isPending}
      />
    </div>
  )
}
