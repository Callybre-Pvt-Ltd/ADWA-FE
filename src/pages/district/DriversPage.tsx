import { useState } from 'react'
import { useDrivers } from '@/hooks/useDrivers'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import { AppDrawer } from '@/components/shared/AppDrawer'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { AvatarWithInitials } from '@/components/shared/AvatarWithInitials'
import { formatDate } from '@/utils/formatters'
import type { Driver } from '@/types/driver.types'
import { Users } from 'lucide-react'

export default function DriversPage() {
  const { data, isLoading, isError, refetch } = useDrivers()
  const [selected, setSelected] = useState<Driver | null>(null)

  const columns: ColumnDef<Driver>[] = [
    {
      key: 'name', header: 'Driver', sortable: true, sortValue: (r) => r.name,
      cell: (r) => (
        <div className="flex items-center gap-2">
          <AvatarWithInitials name={r.name} imageUrl={r.photoUrl} size="sm" />
          {r.name}
        </div>
      ),
    },
    { key: 'mobile', header: 'Mobile', cell: (r) => r.mobile },
    { key: 'district', header: 'District', cell: (r) => r.district },
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge variant={statusToVariant(r.status)} label={r.status} /> },
    { key: 'created', header: 'Registered', cell: (r) => formatDate(r.createdAt), sortable: true, sortValue: (r) => r.createdAt },
  ]

  return (
    <div className="p-6">
      <PageHeader title="Drivers" subtitle="All registered drivers in your district" />
      {isLoading && <SkeletonTable />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (
        <DataTable
          data={data ?? []}
          columns={columns}
          getRowKey={(r) => r.id}
          searchable
          onRowClick={setSelected}
          emptyState={<EmptyState icon={Users} title="No drivers found" />}
        />
      )}
      <AppDrawer open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''}>
        {selected && (
          <div className="space-y-4">
            <AvatarWithInitials name={selected.name} imageUrl={selected.photoUrl} size="lg" />
            <dl className="space-y-2 text-sm">
              {[
                ['Card ID', selected.cardId ?? '—'], ['License', selected.licenseNumber],
                ['Blood Group', selected.bloodGroup], ['Status', selected.status],
                ['Expiry', selected.expiryDate ? formatDate(selected.expiryDate) : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between"><dt className="text-neutral-500">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
          </div>
        )}
      </AppDrawer>
    </div>
  )
}
