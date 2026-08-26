import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  useDriverRequestList,
  useApproveApplication,
  useRejectApplication,
  useDriverRequest,
} from '@/hooks/useDriverRequests'
import { useDistricts } from '@/hooks/useDistricts'
import { CARDS_QUERY_KEY } from '@/hooks/useCards'
import { PRESELECT_STORAGE_KEY } from '@/features/id-card/preselect'
import { driversService } from '@/services'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/utils/formatters'
import type { DriverRequest, RequestStatus } from '@/types/driver.types'
import { ClipboardList, IdCard } from 'lucide-react'

import { districtMapEnToHi, nameTranslations } from '@/utils/translations'

const STATUS_OPTIONS: Array<{ value: string; en: string; hi: string }> = [
  { value: 'all', en: 'All statuses', hi: 'सभी स्थितियाँ' },
  { value: 'PENDING_DISTRICT_REVIEW', en: 'Pending district', hi: 'जिला समीक्षा लंबित' },
  { value: 'FORWARDED_TO_ADMIN', en: 'Forwarded to admin', hi: 'एडमिन को अग्रेषित' },
  { value: 'APPROVED', en: 'Approved', hi: 'स्वीकृत' },
  { value: 'REJECTED_BY_ADMIN', en: 'Rejected by admin', hi: 'एडमिन द्वारा अस्वीकृत' },
  { value: 'REJECTED_BY_DISTRICT', en: 'Rejected by district', hi: 'जिला द्वारा अस्वीकृत' },
]

const translateStatusHi = (status: string) => {
  switch (status) {
    case 'PENDING_DISTRICT_REVIEW': return 'जिला समीक्षा लंबित'
    case 'FORWARDED_TO_ADMIN': return 'अग्रेषित'
    case 'APPROVED': return 'स्वीकृत'
    case 'REJECTED_BY_ADMIN': return 'एडमिन अस्वीकृत'
    case 'REJECTED_BY_DISTRICT': return 'जिला अस्वीकृत'
    case 'REJECTED': return 'अस्वीकृत'
    case 'CANCELLED': return 'रद्द'
    default: return status.replace(/_/g, ' ')
  }
}

const actionableStatuses = new Set<RequestStatus>([
  'FORWARDED_TO_ADMIN',
  'PENDING_DISTRICT_REVIEW',
])

export default function ApplicationsPage() {
  const { t, i18n } = useTranslation('dashboard')
  const isHi = i18n.language === 'hi'
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: districts = [] } = useDistricts()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [openingIdCard, setOpeningIdCard] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stateFilter, setStateFilter] = useState('all')
  const [districtFilter, setDistrictFilter] = useState('all')
  const [approvedQr, setApprovedQr] = useState<{
    cardId: string
    verificationUrl?: string
    verificationCode?: string
    driverName: string
  } | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data: appRes, isLoading, isError, refetch } = useDriverRequestList({
    page,
    size: 10,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : (statusFilter as RequestStatus),
    state: stateFilter === 'all' ? undefined : stateFilter,
    districtId: districtFilter === 'all' ? undefined : districtFilter,
  })
  const applications = appRes?.items ?? []
  const { data: selected, isLoading: detailLoading } = useDriverRequest(selectedId)
  const approve = useApproveApplication()
  const reject = useRejectApplication()

  const stateOptions = useMemo(
    () => [...new Set(districts.map((d) => d.state).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [districts],
  )
  const sortedDistricts = useMemo(() => {
    const list = stateFilter === 'all'
      ? districts
      : districts.filter((d) => d.state === stateFilter)
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }, [districts, stateFilter])

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

  const handleOpenIdCard = async () => {
    if (!selected || openingIdCard) return
    const go = (cardId?: string | null) => {
      if (cardId) {
        try {
          sessionStorage.setItem(PRESELECT_STORAGE_KEY, cardId)
        } catch {
          /* ignore */
        }
      }
      void queryClient.invalidateQueries({ queryKey: CARDS_QUERY_KEY })
      navigate(cardId ? `/admin/id-cards?cardId=${encodeURIComponent(cardId)}` : '/admin/id-cards')
    }
    if (selected.activeCardId) {
      go(selected.activeCardId)
      return
    }
    setOpeningIdCard(true)
    try {
      // Prefer driver linked on the request; fall back to mobile/name search.
      if (selected.driverId) {
        const card = await driversService.getActiveCard(selected.driverId)
        go(card.id)
        return
      }
      const res = await driversService.getAll({ search: selected.mobile, size: 20 })
      const driver =
        res.items.find((d) => d.mobile.replace(/\D/g, '') === selected.mobile.replace(/\D/g, ''))
        ?? res.items.find((d) => d.name.trim().toLowerCase() === selected.name.trim().toLowerCase())
      const card = driver ? await driversService.getActiveCard(driver.id) : null
      go(card?.id)
    } catch {
      go(null)
    } finally {
      setOpeningIdCard(false)
    }
  }

  const handleConfirm = () => {
    if (isPending || !selected || !confirmAction) return
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
  const canAct = selected ? actionableStatuses.has(selected.status) : false
  const hasConflict = Boolean(selected?.registrationConflict)
  const isApproved = selected?.status === 'APPROVED'

  return (
    <div className="w-full space-y-6 pb-6">
      <PageHeader
        title={t('apps.title')}
        subtitle={t('apps.subtitle')}
        action={
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:flex-wrap">
            <Select
              value={stateFilter}
              onValueChange={(v) => {
                setStateFilter(v)
                setDistrictFilter('all')
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={isHi ? 'राज्य' : 'State'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isHi ? 'सभी राज्य' : 'All states'}</SelectItem>
                {stateOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={districtFilter}
              onValueChange={(v) => { setDistrictFilter(v); setPage(1) }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={isHi ? 'जिला' : 'District'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isHi ? 'सभी जिले' : 'All districts'}</SelectItem>
                {sortedDistricts.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {isHi ? (districtMapEnToHi[d.name] || d.name) : d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => { setStatusFilter(v); setPage(1) }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {isHi ? o.hi : o.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
      {isLoading && !appRes ? (
        <SkeletonTable />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          data={applications}
          columns={columns}
          getRowKey={(r) => r.id}
          searchable
          onRowClick={(r) => setSelectedId(r.id)}
          pagination={{
            page,
            pageSize: 10,
            totalItems: appRes?.total ?? 0,
            totalPages: appRes?.pages ?? 1,
            onPageChange: setPage,
            searchValue: search,
            onSearchChange: (v) => { setSearch(v); setPage(1) },
          }}
          emptyState={<EmptyState icon={ClipboardList} title={t('apps.emptyTitle')} description={t('apps.emptyDesc')} />}
        />
      )}
      <AppDrawer
        open={!!selectedId}
        onClose={closeDrawer}
        loading={isPending}
        title={selected?.name ?? t('dashboard.loading')}
        description={selected?.referenceNumber ? `Ref: ${selected.referenceNumber}` : undefined}
        footer={selected && !detailLoading && !approvedQr && (
          <div className="space-y-3">
            {!canAct && !hasConflict && !isApproved && (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {t('apps.cannotApprove', { status: isHi ? translateStatusHi(selected.status) : selected.status.replace(/_/g, ' ') })}
              </p>
            )}
            {isApproved && (
              <Button
                className="w-full gap-2"
                onClick={() => void handleOpenIdCard()}
                loading={openingIdCard}
                loadingText={isHi ? 'खोला जा रहा है…' : 'Opening…'}
              >
                <IdCard className="h-4 w-4" />
                {isHi ? 'आईडी कार्ड बनाएँ / देखें' : 'Generate / view ID card'}
              </Button>
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
                    <Button variant="outline" className="flex-1" onClick={() => setConfirmAction(null)} disabled={isPending}>{t('apps.cancel')}</Button>
                    <Button
                      variant={confirmAction === 'reject' ? 'destructive' : 'default'}
                      className="flex-1"
                      onClick={handleConfirm}
                      loading={isPending}
                      loadingText={t('apps.processing')}
                      disabled={(confirmAction === 'reject' && rejectReason.trim().length < 3) || (confirmAction === 'approve' && hasConflict)}
                    >
                      {confirmAction === 'approve' ? t('dashboard.approve') : t('dashboard.reject')}
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
            <Button asChild variant="outline" className="w-full gap-2">
              <Link
                to={`/admin/id-cards?cardId=${encodeURIComponent(approvedQr.cardId)}`}
                onClick={() => {
                  try {
                    sessionStorage.setItem(PRESELECT_STORAGE_KEY, approvedQr.cardId)
                  } catch {
                    /* ignore */
                  }
                }}
              >
                <IdCard className="h-4 w-4" />
                {isHi ? 'आईडी कार्ड पैनल खोलें' : 'Open ID card panel'}
              </Link>
            </Button>
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
