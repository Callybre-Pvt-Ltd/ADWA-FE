import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
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
    toast.success(isHi ? `${data?.length ?? 0} ड्राइवर रिकॉर्ड निर्यात किए गए` : `Exported ${data?.length ?? 0} driver records`)
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
          data={data ?? []}
          columns={columns}
          getRowKey={(r) => r.id}
          searchable
          onRowClick={setSelected}
          actions={
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)} className="w-full sm:w-auto">
                <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder={isHi ? 'स्थिति' : 'Status'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isHi ? 'सभी स्थितियां' : 'All Statuses'}</SelectItem>
                  {DRIVER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{translateStatus(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={districtId} onValueChange={setDistrictId} className="w-full sm:w-auto">
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
        title={selected ? (isHi && nameTranslations[selected.name] ? nameTranslations[selected.name] : selected.name) : ''}
        footer={(canSuspend || canActivate) && (
          <div className="flex gap-2">
            {canSuspend && (
              <Button variant="destructive" className="flex-1 cursor-pointer" onClick={() => setSuspendOpen(true)}>
                {isHi ? 'निलंबित करें' : 'Suspend'}
              </Button>
            )}
            {canActivate && (
              <Button className="flex-1 cursor-pointer" onClick={handleActivate} disabled={activate.isPending}>
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
        title={isHi ? 'ड्राइवर को निलंबित करें' : 'Suspend Driver'}
        description={isHi ? `क्या आप ${selected?.name} को निलंबित करना चाहते हैं?` : `Suspend ${selected?.name}?`}
        footer={
          <Button
            variant="destructive"
            className="w-full cursor-pointer"
            onClick={handleSuspend}
            disabled={suspendReason.length < 3 || suspend.isPending}
          >
            {suspend.isPending ? (isHi ? 'निलंबित किया जा रहा है...' : 'Suspending...') : (isHi ? 'निलंबन की पुष्टि करें' : 'Confirm Suspend')}
          </Button>
        }
      >
        <div>
          <Label htmlFor="suspendReason">{isHi ? 'कारण *' : 'Reason *'}</Label>
          <Textarea
            id="suspendReason"
            value={suspendReason}
            onChange={e => setSuspendReason(e.target.value)}
            rows={3}
            className="mt-1"
            placeholder={isHi ? 'निलंबन का कारण दर्ज करें...' : 'Reason for suspension...'}
          />
        </div>
      </AppModal>
    </div>
  )
}
