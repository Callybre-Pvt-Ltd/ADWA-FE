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
import { nameTranslations, districtMapEnToHi } from '@/utils/translations'

const requestStatusMapEnToHi: Record<string, string> = {
  'PENDING_DISTRICT_REVIEW': 'जिला समीक्षा लंबित',
  'FORWARDED_TO_ADMIN': 'एडमिन को अग्रेषित',
  'REJECTED_BY_DISTRICT': 'जिला द्वारा अस्वीकृत',
  'APPROVED': 'स्वीकृत',
  'REJECTED': 'अस्वीकृत',
  'PAYMENT_PENDING': 'भुगतान लंबित',
}

export default function RequestsPage() {
  const { i18n } = useTranslation('dashboard')
  const isHi = i18n.language === 'hi'
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

  const translateRequestStatus = (s: string) => {
    if (!isHi) return s.replace(/_/g, ' ')
    return requestStatusMapEnToHi[s] || s.replace(/_/g, ' ')
  }

  const columns: ColumnDef<DriverRequest>[] = [
    { key: 'ref', header: isHi ? 'आवेदन #' : 'Application #', cell: (r) => r.referenceNumber ?? r.id.slice(0, 8) },
    { key: 'name', header: isHi ? 'नाम' : 'Name', cell: (r) => isHi ? (nameTranslations[r.name] || r.name) : r.name, sortable: true, sortValue: (r) => r.name },
    { key: 'mobile', header: isHi ? 'मोबाइल' : 'Mobile', cell: (r) => r.mobile },
    { key: 'district', header: isHi ? 'जिला' : 'District', cell: (r) => isHi ? (districtMapEnToHi[r.district] || r.district) : r.district },
    { key: 'status', header: isHi ? 'स्थिति' : 'Status', cell: (r) => <StatusBadge variant={statusToVariant(r.status)} label={translateRequestStatus(r.status)} /> },
    { key: 'date', header: isHi ? 'प्रस्तुत तिथि' : 'Submitted', cell: (r) => formatDate(r.submittedAt), sortable: true, sortValue: (r) => r.submittedAt },
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
    <div className="w-full space-y-6 pb-6 animate-fade-in">
      <PageHeader
        title={isHi ? 'ड्राइवर अनुरोध' : 'Driver Requests'}
        subtitle={isHi ? 'आवेदनों की समीक्षा करें और एडमिन को अग्रेषित करें' : 'Review applications and forward to admin'}
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
          emptyState={<EmptyState icon={ClipboardList} title={isHi ? 'कोई अनुरोध नहीं मिला' : 'No requests found'} />}
          actions={
            <Select value={status} onValueChange={setStatus} className="w-full sm:w-auto">
              <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder={isHi ? 'सभी' : 'All'} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isHi ? 'सभी' : 'All'}</SelectItem>
                <SelectItem value="PENDING_DISTRICT_REVIEW">{isHi ? 'समीक्षा लंबित' : 'Pending Review'}</SelectItem>
                <SelectItem value="FORWARDED_TO_ADMIN">{isHi ? 'अग्रेषित' : 'Forwarded'}</SelectItem>
                <SelectItem value="REJECTED_BY_DISTRICT">{isHi ? 'अस्वीकृत' : 'Rejected'}</SelectItem>
                <SelectItem value="APPROVED">{isHi ? 'स्वीकृत' : 'Approved'}</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      )}
      <AppDrawer
        open={!!selectedId}
        onClose={closeDrawer}
        title={selected ? (isHi && nameTranslations[selected.name] ? nameTranslations[selected.name] : selected.name) : ''}
        description={selected?.referenceNumber}
        footer={selected?.status === 'PENDING_DISTRICT_REVIEW' && !detailLoading && (
          <div className="flex gap-2">
            <Button variant="destructive" className="flex-1 cursor-pointer" onClick={() => setRejectOpen(true)}>
              {isHi ? 'अस्वीकार करें' : 'Reject'}
            </Button>
            <Button
              className="flex-1 cursor-pointer"
              onClick={() => setForwardOpen(true)}
              disabled={Boolean(selected.registrationConflict)}
            >
              {isHi ? 'एडमिन को अग्रेषित करें' : 'Forward to Admin'}
            </Button>
          </div>
        )}
      >
        {detailLoading && <p className="text-sm text-neutral-500">{isHi ? 'आवेदन लोड हो रहा है...' : 'Loading application...'}</p>}
        {selected && !detailLoading && (
          <>
            <StatusBadge
              variant={statusToVariant(selected.status)}
              label={translateRequestStatus(selected.status)}
              className="mb-4"
            />
            <DriverRequestDetailView request={selected} />
          </>
        )}
      </AppDrawer>

      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title={isHi ? 'आवेदन अस्वीकार करें?' : 'Reject Application?'}
        description={rejectReason || (isHi ? 'अस्वीकृति का कारण प्रदान करें और पुष्टि करें।' : 'Provide a reason in the drawer and confirm.')}
        confirmLabel={isHi ? 'अस्वीकार करें' : 'Reject'}
        variant="destructive"
        onConfirm={handleReject}
        loading={rejectApp.isPending}
      />

      {forwardOpen && selected && (
        <AppDrawer
          open={forwardOpen}
          onClose={() => setForwardOpen(false)}
          title={isHi ? 'एडमिन को अग्रेषित करें' : 'Forward to Admin'}
          footer={
            <Button
              className="w-full cursor-pointer"
              onClick={handleForward}
              disabled={forwardApp.isPending || !paymentProof || !verificationRemarks || Boolean(selected?.registrationConflict)}
            >
              {isHi ? 'अग्रेषित करें' : 'Forward'}
            </Button>
          }
        >
          <div className="space-y-3">
            <div>
              <Label>{isHi ? 'सत्यापन टिप्पणियां' : 'Verification remarks'}</Label>
              <Textarea value={verificationRemarks} onChange={(e) => setVerificationRemarks(e.target.value)} />
            </div>
            <div>
              <Label>{isHi ? 'डीआई नोट्स (वैकल्पिक)' : 'DI notes (optional)'}</Label>
              <Textarea value={diNotes} onChange={(e) => setDiNotes(e.target.value)} />
            </div>
            <div>
              <Label>{isHi ? 'भुगतान स्क्रीनशॉट' : 'Payment screenshot'}</Label>
              <Input type="file" accept="image/*" onChange={(e) => setPaymentProof(e.target.files?.[0] ?? null)} />
            </div>
          </div>
        </AppDrawer>
      )}

      {rejectOpen && (
        <AppDrawer
          open={rejectOpen}
          onClose={() => setRejectOpen(false)}
          title={isHi ? 'आवेदन अस्वीकार करें' : 'Reject Application'}
          footer={
            <Button
              variant="destructive"
              className="w-full cursor-pointer"
              onClick={handleReject}
              disabled={rejectApp.isPending || !rejectReason}
            >
              {isHi ? 'अस्वीकार करें' : 'Reject'}
            </Button>
          }
        >
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={isHi ? 'अस्वीकृति का कारण' : 'Rejection reason'}
          />
        </AppDrawer>
      )}
    </div>
  )
}
