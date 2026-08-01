import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { driversService } from '@/services'
import { useDrivers, useSuspendDriver, useActivateDriver, useDriverActiveCard, DRIVERS_QUERY_KEY } from '@/hooks/useDrivers'
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
import { Download, QrCode, ShieldAlert } from 'lucide-react'

const DRIVER_STATUSES: DriverStatus[] = [
  'APPROVED', 'ID_CARD_GENERATED', 'ACTIVE', 'SUSPENDED', 'EXPIRED',
]

import { districtMapEnToHi, nameTranslations } from '@/utils/translations'

const statusMapEnToHi: Record<string, string> = {
  'APPROVED': 'स्वीकृत',
  'ID_CARD_GENERATED': 'आईडी कार्ड जनरेट हुआ',
  'ACTIVE': 'सक्रिय',
  'SUSPENDED': 'निलंबित',
  'EXPIRED': 'समाप्त',
}

export default function DriverManagementPage() {
  const { i18n } = useTranslation('dashboard')
  const isHi = i18n.language === 'hi'
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<DriverStatus | 'all'>('all')
  const [districtId, setDistrictId] = useState<string>('all')
  const [selected, setSelected] = useState<Driver | null>(null)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [suspendReason, setSuspendReason] = useState('')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data: districts } = useDistricts()
  const { data: driverRes, isLoading, isError, refetch } = useDrivers({
    status: status === 'all' ? undefined : status,
    districtId: districtId === 'all' ? undefined : districtId,
    page,
    size: 10,
    search: search || undefined,
  })
  const drivers = driverRes?.items ?? []
  const suspend = useSuspendDriver()
  const activate = useActivateDriver()
  const { data: activeCard, isLoading: isLoadingCard } = useDriverActiveCard(selected?.id ?? null)

  const prefetchActiveCard = (driverId: string) => {
    void queryClient.prefetchQuery({
      queryKey: [...DRIVERS_QUERY_KEY, 'active-card', driverId],
      queryFn: () => driversService.getActiveCard(driverId),
      staleTime: 1000 * 60 * 5,
    })
  }

  const translateStatus = (s: string) => {
    if (!isHi) return s.replace(/_/g, ' ')
    return statusMapEnToHi[s] || s.replace(/_/g, ' ')
  }

  const columns: ColumnDef<Driver>[] = [
    { key: 'name', header: isHi ? 'नाम' : 'Name', cell: (r) => isHi ? (nameTranslations[r.name] || r.name) : r.name, sortable: true, sortValue: (r) => r.name },
    { key: 'mobile', header: isHi ? 'मोबाइल' : 'Mobile', cell: (r) => r.mobile },
    { key: 'member', header: isHi ? 'सदस्य नंबर' : 'Member No', cell: (r) => r.memberNumber ?? '—' },
    { key: 'license', header: isHi ? 'लाइसेंस' : 'License', cell: (r) => r.licenseNumber },
    { key: 'status', header: isHi ? 'स्थिति' : 'Status', cell: (r) => <StatusBadge variant={statusToVariant(r.status)} label={translateStatus(r.status)} /> },
    { key: 'created', header: isHi ? 'पंजीकृत तिथि' : 'Registered', cell: (r) => formatDate(r.createdAt) },
  ]

  const exportData = () => {
    toast.success(isHi ? `${driverRes?.total ?? 0} ड्राइवर रिकॉर्ड निर्यात किए गए` : `Exported ${driverRes?.total ?? 0} driver records`)
  }

  const handleSuspend = async () => {
    if (suspend.isPending || !selected || suspendReason.length < 3) return
    await suspend.mutateAsync({ id: selected.id, reason: suspendReason })
    setSuspendOpen(false)
    setSelected(null)
    setSuspendReason('')
  }

  const handleActivate = async () => {
    if (activate.isPending || !selected) return
    await activate.mutateAsync(selected.id)
    setSelected(null)
  }

  const canSuspend = selected && ['ACTIVE', 'ID_CARD_GENERATED', 'APPROVED'].includes(selected.status)
  const canActivate = selected?.status === 'SUSPENDED'

  return (
    <div className="w-full space-y-6 pb-6 animate-fade-in">
      <PageHeader
        title={isHi ? 'ड्राइवर प्रबंधन' : 'Driver Management'}
        subtitle={isHi ? 'उन्नत फ़िल्टर के साथ राष्ट्रीय ड्राइवर डेटाबेस' : 'National driver database with advanced filters'}
        action={<Button variant="outline" onClick={exportData} className="w-full sm:w-auto cursor-pointer"><Download className="h-4 w-4" /> {isHi ? 'एक्सपोर्ट' : 'Export'}</Button>}
      />
      {isLoading && <SkeletonTable />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (
        <DataTable
          data={drivers}
          columns={columns}
          getRowKey={(r) => r.id}
          searchable
          onRowClick={setSelected}
          onRowHover={(r) => prefetchActiveCard(r.id)}
          pagination={{
            page,
            pageSize: 10,
            totalItems: driverRes?.total ?? 0,
            totalPages: driverRes?.pages ?? 1,
            onPageChange: setPage,
            searchValue: search,
            onSearchChange: (v) => { setSearch(v); setPage(1) },
          }}
          actions={
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={status} onValueChange={(v) => { setStatus(v as typeof status); setPage(1) }} className="w-full sm:w-auto">
                <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder={isHi ? 'स्थिति' : 'Status'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isHi ? 'सभी स्थितियां' : 'All Statuses'}</SelectItem>
                  {DRIVER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{translateStatus(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={districtId} onValueChange={(v) => { setDistrictId(v); setPage(1) }} className="w-full sm:w-auto">
                <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder={isHi ? 'जिला' : 'District'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isHi ? 'सभी जिले' : 'All Districts'}</SelectItem>
                  {(districts ?? []).map((d) => (
                    <SelectItem key={d.id} value={d.id}>{isHi ? (districtMapEnToHi[d.name] || d.name) : d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />
      )}

      <AppDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        loading={activate.isPending || suspend.isPending}
        title={selected ? (isHi && nameTranslations[selected.name] ? nameTranslations[selected.name] : selected.name) : ''}
        footer={(canSuspend || canActivate) && (
          <div className="flex gap-2">
            {canSuspend && (
              <Button variant="destructive" className="flex-1 cursor-pointer" onClick={() => setSuspendOpen(true)}>
                {isHi ? 'निलंबित करें' : 'Suspend'}
              </Button>
            )}
            {canActivate && (
              <Button
                className="flex-1 cursor-pointer"
                onClick={handleActivate}
                loading={activate.isPending}
                loadingText={isHi ? 'सक्रिय हो रहा है…' : 'Activating…'}
              >
                {isHi ? 'सक्रिय करें' : 'Activate'}
              </Button>
            )}
          </div>
        )}
      >
        {selected && (
          <div className="space-y-4">
            <dl className="space-y-2 text-sm">
              {[
                [isHi ? 'सदस्य नंबर' : 'Member No', selected.memberNumber ?? '—'],
                [isHi ? 'मोबाइल' : 'Mobile', selected.mobile],
                [isHi ? 'लाइसेंस' : 'License', selected.licenseNumber],
                [isHi ? 'स्थिति' : 'Status', translateStatus(selected.status)],
                [isHi ? 'पंजीकृत तिथि' : 'Registered', formatDate(selected.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-neutral-100 pb-1.5">
                  <dt className="text-neutral-500">{k}</dt>
                  <dd className="font-medium text-neutral-900">{v}</dd>
                </div>
              ))}
            </dl>

            {isLoadingCard ? (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-neutral-200" />
                  <div className="h-5 w-36 rounded bg-neutral-200" />
                </div>
                <div className="h-4 w-4/5 rounded bg-neutral-200" />
                <div className="flex flex-col items-center gap-3 pt-2">
                  <div className="h-44 w-44 rounded-xl bg-neutral-200" />
                  <div className="h-3 w-48 rounded bg-neutral-200" />
                  <div className="flex justify-center gap-2 w-full">
                    <div className="h-8 w-24 rounded-md bg-neutral-200" />
                    <div className="h-8 w-28 rounded-md bg-neutral-200" />
                    <div className="h-8 w-24 rounded-md bg-neutral-200" />
                  </div>
                </div>
              </div>
            ) : activeCard ? (
              <DriverQrPanel
                cardId={activeCard.id}
                verificationCode={activeCard.verificationCode}
                driverName={selected.name}
              />
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-amber-900 text-sm space-y-1">
                <p className="font-medium flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  {isHi ? 'कोई सक्रिय आईडी कार्ड नहीं' : 'No Active ID Card'}
                </p>
                <p className="text-xs text-amber-700">
                  {isHi
                    ? 'इस ड्राइवर के लिए अभी तक कोई आईडी कार्ड जनरेट नहीं किया गया है।'
                    : 'No active QR card has been generated for this driver yet.'}
                </p>
              </div>
            )}
          </div>
        )}
      </AppDrawer>

      <AppModal
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        loading={suspend.isPending}
        title={isHi ? 'ड्राइवर को निलंबित करें' : 'Suspend Driver'}
        description={isHi ? `क्या आप ${selected?.name} को निलंबित करना चाहते हैं?` : `Suspend ${selected?.name}?`}
        footer={
          <Button
            variant="destructive"
            className="w-full cursor-pointer"
            onClick={handleSuspend}
            loading={suspend.isPending}
            loadingText={isHi ? 'निलंबित किया जा रहा है…' : 'Suspending…'}
            disabled={suspendReason.length < 3}
          >
            {isHi ? 'निलंबन की पुष्टि करें' : 'Confirm Suspend'}
          </Button>
        }
      >
        <div>
          <Label htmlFor="suspendReason">{isHi ? 'कारण *' : 'Reason *'}</Label>
          <Textarea
            id="suspendReason"
            value={suspendReason}
            onChange={e => setSuspendReason(e.target.value)}
            disabled={suspend.isPending}
            rows={3}
            className="mt-1"
            placeholder={isHi ? 'निलंबन का कारण दर्ज करें...' : 'Reason for suspension...'}
          />
        </div>
      </AppModal>
    </div>
  )
}
