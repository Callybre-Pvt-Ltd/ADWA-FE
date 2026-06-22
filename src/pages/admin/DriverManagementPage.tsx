import { useState } from 'react'
import { toast } from 'sonner'
import { useDrivers, useSuspendDriver, useActivateDriver, useDriverActiveCard } from '@/hooks/useDrivers'
import { DriverQrPanel } from '@/features/qr-verify/DriverQrPanel'
import { useDistricts } from '@/hooks/useDistricts'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import { AppDrawer } from '@/components/shared/AppDrawer'
import { AppModal } from '@/components/shared/AppModal'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { ErrorState } from '@/components/shared/ErrorState'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/utils/formatters'
import type { Driver, DriverStatus } from '@/types/driver.types'
import { Download } from 'lucide-react'

const DRIVER_STATUSES: DriverStatus[] = [
  'APPROVED', 'ID_CARD_GENERATED', 'ACTIVE', 'SUSPENDED', 'EXPIRED',
]

export default function DriverManagementPage() {
  const [status, setStatus] = useState<DriverStatus | 'all'>('all')
  const [districtId, setDistrictId] = useState<string>('all')
  const [selected, setSelected] = useState<Driver | null>(null)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [suspendReason, setSuspendReason] = useState('')

  const { data: districts } = useDistricts()
  const { data, isLoading, isError, refetch } = useDrivers({
    status: status === 'all' ? undefined : status,
    districtId: districtId === 'all' ? undefined : districtId,
  })
  const suspend = useSuspendDriver()
  const activate = useActivateDriver()
  const { data: activeCard } = useDriverActiveCard(selected?.id ?? null)

  const columns: ColumnDef<Driver>[] = [
    { key: 'name', header: 'Name', cell: (r) => r.name, sortable: true, sortValue: (r) => r.name },
    { key: 'mobile', header: 'Mobile', cell: (r) => r.mobile },
    { key: 'member', header: 'Member No', cell: (r) => r.memberNumber ?? '—' },
    { key: 'license', header: 'License', cell: (r) => r.licenseNumber },
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge variant={statusToVariant(r.status)} label={r.status} /> },
    { key: 'created', header: 'Registered', cell: (r) => formatDate(r.createdAt) },
  ]

  const exportData = () => {
    toast.success(`Exported ${data?.length ?? 0} driver records`)
  }

  const handleSuspend = async () => {
    if (!selected || suspendReason.length < 3) return
    await suspend.mutateAsync({ id: selected.id, reason: suspendReason })
    setSuspendOpen(false)
    setSelected(null)
    setSuspendReason('')
  }

  const handleActivate = async () => {
    if (!selected) return
    await activate.mutateAsync(selected.id)
    setSelected(null)
  }

  const canSuspend = selected && ['ACTIVE', 'ID_CARD_GENERATED', 'APPROVED'].includes(selected.status)
  const canActivate = selected?.status === 'SUSPENDED'

  return (
    <div className="p-6">
      <PageHeader
        title="Driver Management"
        subtitle="National driver database with advanced filters"
        action={<Button variant="outline" onClick={exportData}><Download className="h-4 w-4" /> Export</Button>}
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {DRIVER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={districtId} onValueChange={setDistrictId}>
          <SelectTrigger className="w-44"><SelectValue placeholder="District" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {(districts ?? []).map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isLoading && <SkeletonTable />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (
        <DataTable
          data={data ?? []}
          columns={columns}
          getRowKey={(r) => r.id}
          searchable
          onRowClick={setSelected}
        />
      )}

      <AppDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
        footer={(canSuspend || canActivate) && (
          <div className="flex gap-2">
            {canSuspend && (
              <Button variant="destructive" className="flex-1" onClick={() => setSuspendOpen(true)}>
                Suspend
              </Button>
            )}
            {canActivate && (
              <Button className="flex-1" onClick={handleActivate} disabled={activate.isPending}>
                Activate
              </Button>
            )}
          </div>
        )}
      >
        {selected && (
          <div className="space-y-4">
            <dl className="space-y-2 text-sm">
              {[
                ['Member No', selected.memberNumber ?? '—'],
                ['Mobile', selected.mobile],
                ['License', selected.licenseNumber],
                ['Status', selected.status],
                ['Registered', formatDate(selected.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-neutral-500">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            {activeCard && (
              <DriverQrPanel
                cardId={activeCard.id}
                verificationCode={activeCard.verificationCode}
                driverName={selected.name}
              />
            )}
          </div>
        )}
      </AppDrawer>

      <AppModal
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        title="Suspend Driver"
        description={`Suspend ${selected?.name}?`}
        footer={
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleSuspend}
            disabled={suspendReason.length < 3 || suspend.isPending}
          >
            {suspend.isPending ? 'Suspending...' : 'Confirm Suspend'}
          </Button>
        }
      >
        <div>
          <Label htmlFor="suspendReason">Reason *</Label>
          <Textarea
            id="suspendReason"
            value={suspendReason}
            onChange={e => setSuspendReason(e.target.value)}
            rows={3}
            className="mt-1"
            placeholder="Reason for suspension..."
          />
        </div>
      </AppModal>
    </div>
  )
}
