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
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const filters = {
    status: status === 'all' ? undefined : (status as RequestStatus),
    page,
    size: 10,
    search: search || undefined,
  }
  const { data: requestRes, isLoading, isError, refetch } = useDriverRequestList(filters)
  const requests = requestRes?.items ?? []
  const { data: selected, isLoading: detailLoading } = useDriverRequest(selectedId)
  const forwardApp = useForwardApplication()
  const rejectApp = useRejectApplication()

  const translateRequestStatus = (s: string) => {
    if (!isHi) return s.replace(/_/g, ' ')
    return requestStatusMapEnToHi[s] || s.replace(/_/g, ' ')
  }

  const columns: ColumnDef<DriverRequest>[] = [
    { key: 'ref', header: isHi ? 'आवेदन #' : 'Application No.', cell: (r) => r.referenceNumber ?? r.id.slice(0, 8) },
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
    if (forwardApp.isPending || !selected || selected.registrationConflict || !paymentProof) return
    forwardApp.mutate(
      {
        id: selected.id,
        verificationRemarks: verificationRemarks.trim() || undefined,
        paymentProof: paymentProof,
      },
      {
        onSuccess: () => {
          setForwardOpen(false)
          setSelectedId(null)
          setPaymentProof(null)
          setVerificationRemarks('')
        },
      },
    )
  }

  const handleReject = () => {
    if (rejectApp.isPending || !selected || !rejectReason) return
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
      {isLoading && !requestRes ? (
        <SkeletonTable />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          data={requests}
          columns={columns}
          getRowKey={(r) => r.id}
          searchable
          onRowClick={(r) => setSelectedId(r.id)}
          pagination={{
            page,
            pageSize: 10,
            totalItems: requestRes?.total ?? 0,
            totalPages: requestRes?.pages ?? 1,
            onPageChange: setPage,
            searchValue: search,
            onSearchChange: (v) => { setSearch(v); setPage(1) },
          }}
          emptyState={<EmptyState icon={ClipboardList} title={isHi ? 'कोई अनुरोध नहीं मिला' : 'No requests found'} />}
          actions={
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }} className="w-full sm:w-auto">
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
        loading={forwardApp.isPending || rejectApp.isPending}
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

      {forwardOpen && selected && (
        <AppDrawer
          open={forwardOpen}
          onClose={() => setForwardOpen(false)}
          loading={forwardApp.isPending}
          title={isHi ? 'एडमिन को अग्रेषित करें' : 'Forward to Admin'}
          footer={
            <Button
              className="w-full cursor-pointer"
              onClick={handleForward}
              loading={forwardApp.isPending}
              loadingText={isHi ? 'अग्रेषित हो रहा है…' : 'Forwarding…'}
              disabled={Boolean(selected?.registrationConflict) || !paymentProof}
            >
              {isHi ? 'अग्रेषित करें' : 'Forward'}
            </Button>
          }
        >
          <div className="space-y-3">
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-800">
                {isHi ? 'बैंक खाता विवरण (भुगतान के लिए)' : 'Bank account details (for payment)'}
              </p>
              <dl className="space-y-1.5 text-sm">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                  <dt className="text-neutral-500 shrink-0">{isHi ? 'खाताधारक' : 'Account holder'}</dt>
                  <dd className="font-semibold text-neutral-900 sm:text-right">KASHIRAM SEN</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                  <dt className="text-neutral-500 shrink-0">{isHi ? 'बैंक' : 'Bank'}</dt>
                  <dd className="font-semibold text-neutral-900 sm:text-right">State Bank of India</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                  <dt className="text-neutral-500 shrink-0">{isHi ? 'खाता संख्या' : 'Account number'}</dt>
                  <dd className="font-semibold text-neutral-900 font-mono sm:text-right tracking-wide">45391987346</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                  <dt className="text-neutral-500 shrink-0">IFSC</dt>
                  <dd className="font-semibold text-neutral-900 font-mono sm:text-right tracking-wide">SBIN0000519</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                  <dt className="text-neutral-500 shrink-0">{isHi ? 'शाखा' : 'Branch'}</dt>
                  <dd className="font-medium text-neutral-800 sm:text-right">H E Township (Bhopal), Piplani</dd>
                </div>
              </dl>
            </div>
            <div>
              <Label>{isHi ? 'नोट्स (वैकल्पिक)' : 'Notes (optional)'}</Label>
              <Textarea
                value={verificationRemarks}
                onChange={(e) => setVerificationRemarks(e.target.value)}
                placeholder={isHi ? 'एडमिन के लिए कोई टिप्पणी…' : 'Any remarks for the admin…'}
              />
            </div>
            <div>
              <Label>{isHi ? 'भुगतान स्क्रीनशॉट (आवश्यक)' : 'Payment screenshot (required)'}</Label>
              <Input type="file" accept="image/*" onChange={(e) => setPaymentProof(e.target.files?.[0] ?? null)} required />
            </div>
          </div>
        </AppDrawer>
      )}

      {rejectOpen && (
        <AppDrawer
          open={rejectOpen}
          onClose={() => setRejectOpen(false)}
          loading={rejectApp.isPending}
          title={isHi ? 'आवेदन अस्वीकार करें' : 'Reject Application'}
          footer={
            <Button
              variant="destructive"
              className="w-full cursor-pointer"
              onClick={handleReject}
              loading={rejectApp.isPending}
              loadingText={isHi ? 'अस्वीकार हो रहा है…' : 'Rejecting…'}
              disabled={!rejectReason}
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

