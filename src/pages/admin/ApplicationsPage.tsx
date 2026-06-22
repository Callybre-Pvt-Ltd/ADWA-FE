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

export default function ApplicationsPage() {
  const { t } = useTranslation('dashboard')
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
    { key: 'ref', header: 'Reference', cell: (r) => r.referenceNumber ?? r.id.slice(0, 8), sortable: true, sortValue: (r) => r.referenceNumber ?? r.id },
    { key: 'name', header: 'Name', cell: (r) => r.name, sortable: true, sortValue: (r) => r.name },
    { key: 'district', header: 'District', cell: (r) => r.district },
    { key: 'mobile', header: 'Mobile', cell: (r) => r.mobile },
    { key: 'status', header: 'Status', cell: (r) => (
      <div className="flex flex-col gap-1">
        <StatusBadge variant={statusToVariant(r.status)} label={r.status.replace(/_/g, ' ')} />
        {r.registrationConflict && (
          <span className="text-[10px] font-medium text-red-600">Duplicate — cannot approve</span>
        )}
      </div>
    ) },
    { key: 'date', header: 'Forwarded', cell: (r) => formatDate(r.submittedAt), sortable: true, sortValue: (r) => r.submittedAt },
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
    <div className="p-6">
      <PageHeader
        title="Forwarded Applications"
        subtitle="Review applications forwarded by district incharges"
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
          emptyState={<EmptyState icon={ClipboardList} title="No forwarded applications" description="Applications appear here after the district office forwards them with payment proof." />}
        />
      )}
      <AppDrawer
        open={!!selectedId}
        onClose={closeDrawer}
        title={selected?.name ?? 'Application'}
        description={selected?.referenceNumber ? `Ref: ${selected.referenceNumber}` : undefined}
        footer={selected && !detailLoading && !approvedQr && (
          <div className="space-y-3">
            {!canAct && !hasConflict && (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {selected.status === 'APPROVED'
                  ? 'This application is already approved.'
                  : `This application cannot be approved (status: ${selected.status.replace(/_/g, ' ')}).`}
              </p>
            )}
            {canAct && hasConflict && (
              <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                This application duplicates an existing driver or another active application.
                Reject it — approval will always fail.
              </p>
            )}
            {canAct && confirmAction === 'reject' && (
              <div>
                <Label htmlFor="reject-reason">Rejection reason</Label>
                <Input
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection"
                  className="mt-1"
                />
              </div>
            )}
            {canAct && (
              <div className="flex gap-2">
                {confirmAction ? (
                  <>
                    <Button variant="outline" className="flex-1" onClick={() => setConfirmAction(null)}>Cancel</Button>
                    <Button
                      variant={confirmAction === 'reject' ? 'destructive' : 'default'}
                      className="flex-1"
                      onClick={handleConfirm}
                      disabled={isPending || (confirmAction === 'reject' && rejectReason.trim().length < 3) || (confirmAction === 'approve' && hasConflict)}
                    >
                      {isPending ? 'Processing...' : confirmAction === 'approve' ? t('dashboard.approve') : t('dashboard.reject')}
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
              Application approved. Download or print the QR code for the driver&apos;s ID card.
            </p>
            <DriverQrPanel
              cardId={approvedQr.cardId}
              verificationUrl={approvedQr.verificationUrl}
              verificationCode={approvedQr.verificationCode}
              driverName={approvedQr.driverName}
            />
            <Button className="w-full" onClick={closeDrawer}>Done</Button>
          </div>
        )}
        {!approvedQr && detailLoading && <p className="text-sm text-neutral-500">Loading application...</p>}
        {!approvedQr && selected && !detailLoading && (
          <div className="space-y-4">
            <StatusBadge
              variant={statusToVariant(selected.status)}
              label={selected.status.replace(/_/g, ' ')}
            />
            <DriverRequestDetailView request={selected} />
          </div>
        )}
      </AppDrawer>
    </div>
  )
}
