import { useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { IdCard, Download, Printer } from 'lucide-react'
import { useDistrictInchargeCardList } from '@/hooks/useDistrictInchargeCards'
import { useDistricts } from '@/hooks/useDistricts'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { API_BASE_URL } from '@/services/api/client'
import {
  DistrictInchargeCardOverlay,
  type DistrictInchargeCardActions,
} from './DistrictInchargeCardOverlay'
import { formatDate } from '@/utils/formatters'
import { normalizeVerifyUrl } from '@/utils/verifyUrl'
import { districtMapEnToHi } from '@/utils/translations'
import type { DistrictInchargeCard } from '@/services/api/districtInchargeCards.service'

/** Public, unauthenticated — same endpoint the QR verify page uses. */
function cardPhotoUrl(verificationCode: string): string {
  return `${API_BASE_URL}/verification/${verificationCode}/photo`
}

function ViewField({ label, value, span }: { label: string; value: ReactNode; span?: boolean }) {
  return (
    <div className={span ? 'col-span-2' : undefined}>
      <dt className="text-[11px] uppercase tracking-wide text-neutral-400">{label}</dt>
      <dd className="text-neutral-900">{value}</dd>
    </div>
  )
}

export function DistrictInchargeCardsList() {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'
  const { data: districts = [] } = useDistricts()
  const [districtFilter, setDistrictFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [viewCard, setViewCard] = useState<DistrictInchargeCard | null>(null)
  const viewActionsRef = useRef<DistrictInchargeCardActions | null>(null)

  const { data, isLoading, isError, refetch } = useDistrictInchargeCardList({
    page,
    size: 10,
    search: search || undefined,
    districtId: districtFilter === 'all' ? undefined : districtFilter,
  })
  const cards = data?.items ?? []

  const sortedDistricts = useMemo(
    () => [...districts].sort((a, b) => a.name.localeCompare(b.name)),
    [districts],
  )

  const columns: ColumnDef<DistrictInchargeCard>[] = [
    {
      key: 'photo',
      header: isHi ? 'फ़ोटो' : 'Photo',
      cell: (r) => (
        <div className="h-10 w-10 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
          <img
            src={cardPhotoUrl(r.verificationCode)}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      ),
    },
    { key: 'cardNumber', header: isHi ? 'कार्ड नंबर' : 'Card no.', cell: (r) => r.cardNumber, sortable: true, sortValue: (r) => r.cardNumber },
    { key: 'name', header: isHi ? 'नाम' : 'Name', cell: (r) => r.fullName, sortable: true, sortValue: (r) => r.fullName },
    { key: 'designation', header: isHi ? 'पदाधिकारी' : 'Designation', cell: (r) => r.designation || '—' },
    {
      key: 'district',
      header: isHi ? 'जिला' : 'District',
      cell: (r) => (isHi ? districtMapEnToHi[r.districtNameSnapshot] || r.districtNameSnapshot : r.districtNameSnapshot),
    },
    { key: 'issued', header: isHi ? 'जारी तिथि' : 'Issued', cell: (r) => (r.issuedAt ? formatDate(r.issuedAt) : '—') },
    { key: 'expires', header: isHi ? 'समाप्ति तिथि' : 'Expires', cell: (r) => (r.expiresAt ? formatDate(r.expiresAt) : '—') },
    {
      key: 'status',
      header: isHi ? 'स्थिति' : 'Status',
      cell: (r) => <StatusBadge variant={statusToVariant(r.status)} label={r.status.replace(/_/g, ' ')} />,
    },
  ]

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <IdCard className="h-5 w-5 text-blue-700" />
          <h2 className="text-sm font-bold text-neutral-900">
            {isHi ? 'जारी किए गए कार्ड' : 'Issued cards'}
          </h2>
        </div>
        <Select
          value={districtFilter}
          onValueChange={(v) => {
            setDistrictFilter(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder={isHi ? 'जिला चुनें' : 'Filter by district'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isHi ? 'सभी जिले' : 'All districts'}</SelectItem>
            {sortedDistricts.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {isHi ? districtMapEnToHi[d.name] || d.name : d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && !data ? (
        <SkeletonTable rows={5} />
      ) : isError ? (
        <ErrorState message={isHi ? 'कार्ड लोड करने में विफल।' : 'Failed to load cards.'} onRetry={refetch} />
      ) : (
        <DataTable
          data={cards}
          columns={columns}
          getRowKey={(r) => r.id}
          onRowClick={(r) => setViewCard(r)}
          searchable
          searchPlaceholder={isHi ? 'नाम या कार्ड नंबर खोजें' : 'Search name or card number'}
          emptyState={
            <EmptyState
              icon={IdCard}
              title={isHi ? 'कोई कार्ड नहीं मिला' : 'No cards found'}
              description={
                search || districtFilter !== 'all'
                  ? isHi
                    ? 'इस खोज/फ़िल्टर से कोई कार्ड मेल नहीं खाता। खोज साफ़ करें या बदलें।'
                    : 'No cards match this search or filter. Try clearing or changing it.'
                  : isHi
                    ? 'अभी तक इस जिले के लिए कोई कार्ड जारी नहीं किया गया है।'
                    : 'No district incharge cards have been issued yet.'
              }
            />
          }
          pagination={{
            page: data?.page ?? 1,
            pageSize: data?.size ?? 10,
            totalItems: data?.total ?? cards.length,
            totalPages: data?.pages ?? 1,
            onPageChange: setPage,
            searchValue: search,
            onSearchChange: (v) => {
              setSearch(v)
              setPage(1)
            },
          }}
        />
      )}

      <Dialog open={!!viewCard} onOpenChange={(open) => !open && setViewCard(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{viewCard?.fullName}</DialogTitle>
          </DialogHeader>
          {viewCard && (
            <div className="space-y-4">
              <DistrictInchargeCardOverlay
                values={{
                  fullName: viewCard.fullName,
                  designation: viewCard.designation || '',
                  districtName: viewCard.districtNameSnapshot,
                  districtCode: viewCard.districtCodeSnapshot,
                  cardNumber: viewCard.cardNumber,
                  issueDate: viewCard.issuedAt || '',
                  expiryDate: viewCard.expiresAt || '',
                }}
                photoUrl={cardPhotoUrl(viewCard.verificationCode)}
                verificationUrl={normalizeVerifyUrl('', viewCard.verificationCode)}
                onActionsReady={(actions) => {
                  viewActionsRef.current = actions
                }}
              />

              <div className="flex gap-2">
                <Button className="flex-1 gap-2" onClick={() => viewActionsRef.current?.downloadPdf()}>
                  <Download className="h-4 w-4" />
                  {isHi ? 'PDF डाउनलोड' : 'Download PDF'}
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={() => viewActionsRef.current?.print()}>
                  <Printer className="h-4 w-4" />
                  {isHi ? 'प्रिंट करें' : 'Print'}
                </Button>
              </div>

              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <ViewField
                  label={isHi ? 'स्थिति' : 'Status'}
                  value={<StatusBadge variant={statusToVariant(viewCard.status)} label={viewCard.status.replace(/_/g, ' ')} />}
                />
                <ViewField
                  label={isHi ? 'सत्यापन कोड' : 'Verification code'}
                  value={<span className="break-all font-mono text-xs">{viewCard.verificationCode}</span>}
                />
              </dl>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
