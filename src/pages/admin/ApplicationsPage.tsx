import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useForwardedApplications,
  useApproveApplication,
  useRejectApplication,
  useDriverRequest,
} from '@/hooks/useDriverRequests'
import { DriverQrPanel } from '@/features/qr-verify/DriverQrPanel'
import { DriverRequestDetailView } from '@/features/driver-request/DriverRequestDetailView'
import { normalizeVerifyUrl } from '@/utils/verifyUrl'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import { AppDrawer } from '@/components/shared/AppDrawer'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/utils/formatters'
import type { DriverRequest } from '@/types/driver.types'
import { ClipboardList } from 'lucide-react'

import { districtMapEnToHi, nameTranslations } from '@/utils/translations'

const translateStatusHi = (status: string) => {
  switch (status) {
    case 'FORWARDED_TO_ADMIN': return 'अग्रेषित'
    case 'APPROVED': return 'स्वीकृत'
    case 'REJECTED': return 'अस्वीकृत'
    case 'PAYMENT_PENDING': return 'भुगतान लंबित'
    default: return status.replace(/_/g, ' ')
  }
}

export default function ApplicationsPage() {
  const { t, i18n } = useTranslation('dashboard')
  const isHi = i18n.language === 'hi'
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [approvedQr, setApprovedQr] = useState<{
    cardId: string
    verificationUrl?: string
    verificationCode?: string
    driverName: string
  } | null>(null)
  const { data, isLoading, isError, refetch } = useForwardedApplications()
  const { data: selected, isLoading: detailLoading } = useDriverRequest(selectedId)
  const approve = useApproveApplication()
  const reject = useRejectApplication()

  const columns: ColumnDef<DriverRequest>[] = [
    { key: 'ref', header: t('apps.colRef'), cell: (r) => r.referenceNumber ?? r.id.slice(0, 8), sortable: true, sortValue: (r) => r.referenceNumber ?? r.id },
    { key: 'name', header: t('apps.colName'), cell: (r) => isHi ? (nameTranslations[r.name] || r.name) : r.name, sortable: true, sortValue: (r) => r.name },
    { key: 'district', header: t('apps.colDistrict'), cell: (r) => isHi ? (districtMapEnToHi[r.district] || r.district) : r.district },
    { key: 'mobile', header: t('apps.colMobile'), cell: (r) => r.mobile },
    { key: 'status', header: t('apps.colStatus'), cell: (r) => (
      <div className="flex flex-col gap-1">
        <StatusBadge variant={statusToVariant(r.status)} label={isHi ? translateStatusHi(r.status) : r.status.replace(/_/g, ' ')} />
        {r.registrationConflict && (
          <span className="text-[10px] font-medium text-red-600">{t('apps.duplicateText')}</span>
        )}
      </div>
    ) },
    { key: 'date', header: t('apps.colForwarded'), cell: (r) => formatDate(r.submittedAt), sortable: true, sortValue: (r) => r.submittedAt },
  ]

  const closeDrawer = () => {
    setSelectedId(null)
    setConfirmAction(null)
    setRejectReason('')
    setApprovedQr(null)
  }

  const handleConfirm = () => {
    if (!selected || !confirmAction) return
    if (confirmAction === 'approve') {
      approve.mutate(selected.id, {
        onSuccess: (result) => {
          setConfirmAction(null)
          void refetch()
          if (result.cardId) {
            setApprovedQr({
              cardId: result.cardId,
              verificationUrl: normalizeVerifyUrl(
                result.verificationUrl ?? '',
                result.verificationCode,
              ),
              verificationCode: result.verificationCode,
              driverName: selected.name,
            })
          } else {
            closeDrawer()
          }
        },
      })
    } else {
      reject.mutate({ id: selected.id, reason: rejectReason || 'Rejected by admin' }, {
        onSuccess: () => {
          setConfirmAction(null)
          closeDrawer()
          void refetch()
        },
      })
    }
  }

  const isPending = approve.isPending || reject.isPending
  const canAct = selected?.status === 'FORWARDED_TO_ADMIN'
  const hasConflict = Boolean(selected?.registrationConflict)

  return (
    <div className="w-full space-y-6 pb-6">
      <PageHeader
        title={t('apps.title')}
        subtitle={t('apps.subtitle')}
      />
      {isLoading && <SkeletonTable />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (
        <DataTable
          data={data ?? []}
          columns={columns}
          getRowKey={(r) => r.id}
          searchable
          onRowClick={(r) => setSelectedId(r.id)}
          emptyState={<EmptyState icon={ClipboardList} title={t('apps.emptyTitle')} description={t('apps.emptyDesc')} />}
        />
      )}
      <AppDrawer
        open={!!selectedId}
        onClose={closeDrawer}
        title={selected?.name ?? t('dashboard.loading')}
        description={selected?.referenceNumber ? `Ref: ${selected.referenceNumber}` : undefined}
        footer={selected && !detailLoading && !approvedQr && (
          <div className="space-y-3">
            {!canAct && !hasConflict && (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {selected.status === 'APPROVED'
                  ? t('apps.alreadyApproved')
                  : t('apps.cannotApprove', { status: isHi ? translateStatusHi(selected.status) : selected.status.replace(/_/g, ' ') })}
              </p>
            )}
            {canAct && hasConflict && (
              <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {t('apps.duplicateWarning')}
              </p>
            )}
            {canAct && confirmAction === 'reject' && (
              <div>
                <Label htmlFor="reject-reason">{t('apps.rejectReason')}</Label>
                <Input
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t('apps.rejectReasonPlaceholder')}
                  className="mt-1"
                />
              </div>
            )}
            {canAct && (
              <div className="flex gap-2">
                {confirmAction ? (
                  <>
                    <Button variant="outline" className="flex-1" onClick={() => setConfirmAction(null)}>{t('apps.cancel')}</Button>
                    <Button
                      variant={confirmAction === 'reject' ? 'destructive' : 'default'}
                      className="flex-1"
                      onClick={handleConfirm}
                      disabled={isPending || (confirmAction === 'reject' && rejectReason.trim().length < 3) || (confirmAction === 'approve' && hasConflict)}
                    >
                      {isPending ? t('apps.processing') : confirmAction === 'approve' ? t('dashboard.approve') : t('dashboard.reject')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="destructive" className="flex-1" onClick={() => setConfirmAction('reject')}>
                      {t('dashboard.reject')}
                    </Button>
                    <Button className="flex-1" onClick={() => setConfirmAction('approve')} disabled={hasConflict}>
                      {t('dashboard.approve')}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      >
        {approvedQr && (
          <div className="space-y-4">
            <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {t('apps.approvedSuccess')}
            </p>
            <DriverQrPanel
              cardId={approvedQr.cardId}
              verificationUrl={approvedQr.verificationUrl}
              verificationCode={approvedQr.verificationCode}
              driverName={approvedQr.driverName}
            />
            <Button className="w-full" onClick={closeDrawer}>{t('apps.done')}</Button>
          </div>
        )}
        {!approvedQr && detailLoading && <p className="text-sm text-neutral-500">{t('apps.loading')}</p>}
        {!approvedQr && selected && !detailLoading && (
          <div className="space-y-4">
            <StatusBadge
              variant={statusToVariant(selected.status)}
              label={isHi ? translateStatusHi(selected.status) : selected.status.replace(/_/g, ' ')}
            />
            <DriverRequestDetailView request={selected} />
          </div>
        )}
      </AppDrawer>
    </div>
  )
}
