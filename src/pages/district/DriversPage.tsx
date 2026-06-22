import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useDrivers, useDriverCards } from '@/hooks/useDrivers'
import { cardsService } from '@/services'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import { AppDrawer } from '@/components/shared/AppDrawer'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { AvatarWithInitials } from '@/components/shared/AvatarWithInitials'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils/formatters'
import type { Driver } from '@/types/driver.types'
import { Download, Users } from 'lucide-react'

export default function DriversPage() {
  const { data, isLoading, isError, refetch } = useDrivers()
  const { data: cards } = useDriverCards()
  const [selected, setSelected] = useState<Driver | null>(null)
  const [downloading, setDownloading] = useState(false)

  const cardByDriver = useMemo(() => {
    const map = new Map<string, string>()
    cards?.forEach(card => map.set(card.driverId, card.id))
    return map
  }, [cards])

  const handleDownload = async (driverId: string) => {
    const cardId = cardByDriver.get(driverId)
    if (!cardId) {
      toast.error('No ID card found for this driver')
      return
    }
    setDownloading(true)
    try {
      await cardsService.downloadPdf(cardId)
      toast.success('Card download started')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setDownloading(false)
    }
  }

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
    { key: 'member', header: 'Member No', cell: (r) => r.memberNumber ?? '—' },
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge variant={statusToVariant(r.status)} label={r.status} /> },
    { key: 'created', header: 'Registered', cell: (r) => formatDate(r.createdAt), sortable: true, sortValue: (r) => r.createdAt },
  ]

  const selectedCardId = selected ? cardByDriver.get(selected.id) : undefined

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
      <AppDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
        footer={selectedCardId ? (
          <Button
            className="w-full"
            onClick={() => selected && handleDownload(selected.id)}
            disabled={downloading}
          >
            <Download className="h-4 w-4" /> Download ID Card
          </Button>
        ) : undefined}
      >
        {selected && (
          <div className="space-y-4">
            <AvatarWithInitials name={selected.name} imageUrl={selected.photoUrl} size="lg" />
            <dl className="space-y-2 text-sm">
              {[
                ['Member No', selected.memberNumber ?? '—'],
                ['License', selected.licenseNumber],
                ['Blood Group', selected.bloodGroup],
                ['Status', selected.status],
                ['Registered', formatDate(selected.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-neutral-500">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            {!selectedCardId && (
              <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3">No ID card generated yet.</p>
            )}
          </div>
        )}
      </AppDrawer>
    </div>
  )
}
