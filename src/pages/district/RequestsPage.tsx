import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useDriverRequestList,
  useDriverRequest,
  useForwardApplication,
  useRejectApplication,
} from '@/hooks/useDriverRequests'
import { DriverRequestDetailView } from '@/features/driver-request/DriverRequestDetailView'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/utils/formatters'
import type { DriverRequest, RequestStatus } from '@/types/driver.types'
import { ClipboardList } from 'lucide-react'

export default function RequestsPage() {
  const { t } = useTranslation('dashboard')
  const [status, setStatus] = useState<string>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [forwardOpen, setForwardOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [verificationRemarks, setVerificationRemarks] = useState('')
  const [diNotes, setDiNotes] = useState('')
  const [paymentProof, setPaymentProof] = useState<File | null>(null)

  const filters = status === 'all' ? undefined : { status: status as RequestStatus }
  const { data, isLoading, isError, refetch } = useDriverRequestList(filters)
  const { data: selected, isLoading: detailLoading } = useDriverRequest(selectedId)
  const forwardApp = useForwardApplication()
  const rejectApp = useRejectApplication()

  const columns: ColumnDef<DriverRequest>[] = [
    { key: 'ref', header: 'Application #', cell: (r) => r.referenceNumber ?? r.id },
    { key: 'name', header: 'Name', cell: (r) => r.name, sortable: true, sortValue: (r) => r.name },
    { key: 'mobile', header: 'Mobile', cell: (r) => r.mobile },
    { key: 'district', header: 'District', cell: (r) => r.district },
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge variant={statusToVariant(r.status)} label={r.status} /> },
    { key: 'date', header: 'Submitted', cell: (r) => formatDate(r.submittedAt), sortable: true, sortValue: (r) => r.submittedAt },
  ]

  const closeDrawer = () => {
    setSelectedId(null)
    setRejectOpen(false)
    setForwardOpen(false)
  }

  const handleForward = () => {
    if (!selected || !paymentProof || !verificationRemarks || selected.registrationConflict) return
    forwardApp.mutate(
      { id: selected.id, verificationRemarks, paymentProof, diNotes: diNotes || undefined },
      {
        onSuccess: () => {
          setForwardOpen(false)
          setSelectedId(null)
          setPaymentProof(null)
          setVerificationRemarks('')
          setDiNotes('')
        },
      },
    )
  }

  const handleReject = () => {
    if (!selected || !rejectReason) return
    rejectApp.mutate(
      { id: selected.id, reason: rejectReason },
      {
        onSuccess: () => {
          setRejectOpen(false)
          setSelectedId(null)
          setRejectReason('')
        },
      },
    )
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Driver Requests"
        subtitle="Review applications and forward to admin"
        action={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PENDING_DISTRICT_REVIEW">Pending Review</SelectItem>
              <SelectItem value="FORWARDED_TO_ADMIN">Forwarded</SelectItem>
              <SelectItem value="REJECTED_BY_DISTRICT">Rejected</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
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
          onRowClick={(r) => setSelectedId(r.id)}
          emptyState={<EmptyState icon={ClipboardList} title="No requests found" />}
        />
      )}
      <AppDrawer
        open={!!selectedId}
        onClose={closeDrawer}
        title={selected?.name ?? ''}
        description={selected?.referenceNumber}
        footer={selected?.status === 'PENDING_DISTRICT_REVIEW' && !detailLoading && (
          <div className="flex gap-2">
            <Button variant="destructive" className="flex-1" onClick={() => setRejectOpen(true)}>{t('dashboard.reject')}</Button>
            <Button
              className="flex-1"
              onClick={() => setForwardOpen(true)}
              disabled={Boolean(selected.registrationConflict)}
            >
              Forward to Admin
            </Button>
          </div>
        )}
      >
        {detailLoading && <p className="text-sm text-neutral-500">Loading application...</p>}
        {selected && !detailLoading && (
          <>
            <StatusBadge
              variant={statusToVariant(selected.status)}
              label={selected.status.replace(/_/g, ' ')}
              className="mb-4"
            />
            <DriverRequestDetailView request={selected} />
          </>
        )}
      </AppDrawer>
      <ConfirmDialog open={rejectOpen} onOpenChange={setRejectOpen} title="Reject Application?" description={rejectReason || 'Provide a reason in the drawer and confirm.'} confirmLabel={t('dashboard.reject')} variant="destructive" onConfirm={handleReject} loading={rejectApp.isPending} />
      {forwardOpen && selected && (
        <AppDrawer open={forwardOpen} onClose={() => setForwardOpen(false)} title="Forward to Admin" footer={<Button className="w-full" onClick={handleForward} disabled={forwardApp.isPending || !paymentProof || !verificationRemarks || Boolean(selected?.registrationConflict)}>Forward</Button>}>
          <div className="space-y-3">
            <div><Label>Verification remarks</Label><Textarea value={verificationRemarks} onChange={(e) => setVerificationRemarks(e.target.value)} /></div>
            <div><Label>DI notes (optional)</Label><Textarea value={diNotes} onChange={(e) => setDiNotes(e.target.value)} /></div>
            <div><Label>Payment screenshot</Label><Input type="file" accept="image/*" onChange={(e) => setPaymentProof(e.target.files?.[0] ?? null)} /></div>
          </div>
        </AppDrawer>
      )}
      {rejectOpen && (
        <AppDrawer open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Application" footer={<Button variant="destructive" className="w-full" onClick={handleReject} disabled={rejectApp.isPending || !rejectReason}>Reject</Button>}>
          <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Rejection reason" />
        </AppDrawer>
      )}
    </div>
  )
}
