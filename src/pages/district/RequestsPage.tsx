import { useState, useEffect } from 'react'
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
import { ClipboardList, Copy, Download } from 'lucide-react'
import { nameTranslations, districtMapEnToHi } from '@/utils/translations'
import { PAYMENT_INFO } from '@/constants'
import { toast } from 'sonner'
import { cardsService, driversService } from '@/services'

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
  const [paymentPreviewUrl, setPaymentPreviewUrl] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [downloadingCard, setDownloadingCard] = useState(false)

  useEffect(() => {
    if (!paymentProof) {
      setPaymentPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(paymentProof)
    setPaymentPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [paymentProof])

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
    if (forwardApp.isPending || !selected || selected.registrationConflict) return
    if (!paymentProof) {
      toast.error(isHi ? 'भुगतान स्क्रीनशॉट आवश्यक है' : 'Payment screenshot is required')
      return
    }
    forwardApp.mutate(
      {
        id: selected.id,
        verificationRemarks: verificationRemarks.trim() || undefined,
        paymentProof,
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

  const handleDownloadApprovedCard = async () => {
    if (!selected || selected.status !== 'APPROVED' || downloadingCard) return
    setDownloadingCard(true)
    try {
      const res = await driversService.getAll({ search: selected.mobile, size: 20 })
      const driver =
        res.items.find((d) => d.mobile.replace(/\D/g, '') === selected.mobile.replace(/\D/g, ''))
        ?? res.items.find((d) => d.name.trim().toLowerCase() === selected.name.trim().toLowerCase())
      if (!driver) {
        throw new Error(
          isHi
            ? 'स्वीकृत ड्राइवर नहीं मिला — Drivers पेज से डाउनलोड करें'
            : 'Approved driver not found — try Download from Drivers page',
        )
      }
      const card = await driversService.getActiveCard(driver.id)
      await cardsService.downloadPdf(
        card.id,
        `ADWA-${driver.memberNumber || card.cardNumber}.pdf`,
      )
      toast.success(isHi ? 'कार्ड डाउनलोड होना शुरू हो गया है' : 'Card download started')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (isHi ? 'डाउनलोड विफल' : 'Download failed'))
    } finally {
      setDownloadingCard(false)
    }
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
        loading={forwardApp.isPending || rejectApp.isPending || downloadingCard}
        title={selected ? (isHi && nameTranslations[selected.name] ? nameTranslations[selected.name] : selected.name) : ''}
        description={selected?.referenceNumber}
        footer={
          !detailLoading && selected ? (
            selected.status === 'PENDING_DISTRICT_REVIEW' ? (
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
            ) : selected.status === 'APPROVED' ? (
              <Button
                className="w-full cursor-pointer gap-2"
                onClick={() => void handleDownloadApprovedCard()}
                loading={downloadingCard}
                loadingText={isHi ? 'डाउनलोड हो रहा है…' : 'Downloading…'}
              >
                <Download className="h-4 w-4" />
                {isHi ? 'आईडी कार्ड डाउनलोड करें' : 'Download ID Card'}
              </Button>
            ) : undefined
          ) : undefined
        }
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
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-800">
                {isHi ? 'भुगतान विवरण (UPI / बैंक)' : 'Payment details (UPI / bank)'}
              </p>
              <div className="flex flex-col items-center gap-3">
                <img
                  src={PAYMENT_INFO.upiQrSrc}
                  alt={`${PAYMENT_INFO.accountHolder} UPI QR`}
                  width={220}
                  height={340}
                  className="w-48 sm:w-56 rounded-xl border border-white shadow-sm bg-white object-contain"
                  loading="eager"
                  decoding="async"
                />
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-blue-900">{PAYMENT_INFO.upiId}</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 cursor-pointer"
                    onClick={() => {
                      void navigator.clipboard.writeText(PAYMENT_INFO.upiId)
                      toast.success(isHi ? 'UPI ID कॉपी हो गया' : 'UPI ID copied')
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {isHi ? 'कॉपी' : 'Copy'}
                  </button>
                </div>
              </div>
              <dl className="space-y-1.5 text-sm border-t border-blue-100 pt-3">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                  <dt className="text-neutral-500 shrink-0">{isHi ? 'खाताधारक' : 'Account holder'}</dt>
                  <dd className="font-semibold text-neutral-900 sm:text-right">{PAYMENT_INFO.accountHolder}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                  <dt className="text-neutral-500 shrink-0">{isHi ? 'बैंक' : 'Bank'}</dt>
                  <dd className="font-semibold text-neutral-900 sm:text-right">
                    {PAYMENT_INFO.bankName} {PAYMENT_INFO.accountNumberMasked}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                  <dt className="text-neutral-500 shrink-0">{isHi ? 'खाता संख्या' : 'Account number'}</dt>
                  <dd className="font-semibold text-neutral-900 font-mono sm:text-right tracking-wide">{PAYMENT_INFO.accountNumber}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                  <dt className="text-neutral-500 shrink-0">IFSC</dt>
                  <dd className="font-semibold text-neutral-900 font-mono sm:text-right tracking-wide">{PAYMENT_INFO.ifsc}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                  <dt className="text-neutral-500 shrink-0">{isHi ? 'शाखा' : 'Branch'}</dt>
                  <dd className="font-medium text-neutral-800 sm:text-right">{PAYMENT_INFO.branch}</dd>
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
              <Label className="flex items-center gap-1">
                {isHi ? 'भुगतान स्क्रीनशॉट' : 'Payment screenshot'}
                <span className="text-red-600">*</span>
                <span className="text-[11px] font-normal text-red-600">
                  ({isHi ? 'आवश्यक' : 'required'})
                </span>
              </Label>
              <Input
                type="file"
                accept="image/*"
                className="mt-1"
                onChange={(e) => setPaymentProof(e.target.files?.[0] ?? null)}
                required
              />
              {paymentProof ? (
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-emerald-700 font-medium">
                    {isHi ? `चयनित: ${paymentProof.name}` : `Selected: ${paymentProof.name}`}
                  </p>
                  {paymentPreviewUrl && (
                    <img
                      src={paymentPreviewUrl}
                      alt="Payment proof preview"
                      className="max-h-40 rounded-lg border border-neutral-200 object-contain bg-white"
                    />
                  )}
                </div>
              ) : (
                <p className="mt-1 text-xs text-amber-700">
                  {isHi
                    ? 'बिना भुगतान स्क्रीनशॉट के अग्रेषित नहीं कर सकते।'
                    : 'You cannot forward without uploading the payment screenshot.'}
                </p>
              )}
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

