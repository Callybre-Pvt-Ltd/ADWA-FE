import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDrivers, useDriverActiveCard } from '@/hooks/useDrivers'
import { useDeleteCard } from '@/hooks/useCards'
import { driversService } from '@/services'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import { AppDrawer } from '@/components/shared/AppDrawer'
import { AppModal } from '@/components/shared/AppModal'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { AvatarWithInitials } from '@/components/shared/AvatarWithInitials'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils/formatters'
import type { Driver } from '@/types/driver.types'
import { Download, Trash2, Users } from 'lucide-react'
import { nameTranslations } from '@/utils/translations'
import { PRESELECT_STORAGE_KEY } from '@/features/id-card/preselect'

const statusMapEnToHi: Record<string, string> = {
  'APPROVED': 'स्वीकृत',
  'ID_CARD_GENERATED': 'आईडी कार्ड जनरेट हुआ',
  'ACTIVE': 'सक्रिय',
  'SUSPENDED': 'निलंबित',
  'EXPIRED': 'समाप्त',
}

/** Admin has approved the driver — ID card download is allowed. */
const DOWNLOADABLE_STATUSES = new Set(['APPROVED', 'ID_CARD_GENERATED', 'ACTIVE'])

export default function DriversPage() {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Driver | null>(null)
  const [opening, setOpening] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: driverRes, isLoading, isError, refetch } = useDrivers({
    page,
    size: 10,
    search: search || undefined,
  })
  const drivers = driverRes?.items ?? []
  const { data: activeCard, isLoading: cardLoading, isError: cardError } = useDriverActiveCard(
    selected?.id ?? null,
  )
  const deleteCard = useDeleteCard()

  const handleDelete = () => {
    if (!activeCard || deleteCard.isPending) return
    deleteCard.mutate(
      { cardId: activeCard.id },
      {
        onSuccess: () => {
          setDeleteOpen(false)
          setSelected(null)
        },
      },
    )
  }

  const translateStatus = (s: string) => {
    if (!isHi) return s.replace(/_/g, ' ')
    return statusMapEnToHi[s] || s.replace(/_/g, ' ')
  }

  // "Download" here doesn't fetch the PDF itself — it hands off to the ID
  // Generation section with this driver's card pre-selected, so the actual
  // download (and any edit-before-download) happens from that one place.
  const handleDownload = async () => {
    if (opening || !selected) return
    if (!DOWNLOADABLE_STATUSES.has(selected.status)) {
      toast.error(
        isHi
          ? 'एडमिन द्वारा स्वीकृत होने के बाद ही आईडी कार्ड डाउनलोड हो सकता है'
          : 'ID card can be downloaded only after admin approval',
      )
      return
    }
    setOpening(true)
    try {
      const card = activeCard ?? (await driversService.getActiveCard(selected.id))
      try {
        sessionStorage.setItem(PRESELECT_STORAGE_KEY, card.id)
      } catch {
        /* ignore */
      }
      navigate(`/district/id-generation?cardId=${encodeURIComponent(card.id)}`)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : (isHi ? 'कार्ड नहीं मिला' : 'Could not find this driver’s card'),
      )
    } finally {
      setOpening(false)
    }
  }

  const columns: ColumnDef<Driver>[] = [
    {
      key: 'name', header: isHi ? 'ड्राइवर' : 'Driver', sortable: true, sortValue: (r) => r.name,
      cell: (r) => (
        <div className="flex items-center gap-2">
          <AvatarWithInitials name={r.name} imageUrl={r.photoUrl} size="sm" />
          <span>{isHi ? (nameTranslations[r.name] || r.name) : r.name}</span>
        </div>
      ),
    },
    { key: 'mobile', header: isHi ? 'मोबाइल' : 'Mobile', cell: (r) => r.mobile },
    { key: 'member', header: isHi ? 'सदस्य नंबर' : 'Member No', cell: (r) => r.memberNumber ?? '—' },
    { key: 'status', header: isHi ? 'स्थिति' : 'Status', cell: (r) => <StatusBadge variant={statusToVariant(r.status)} label={translateStatus(r.status)} /> },
    { key: 'created', header: isHi ? 'पंजीकृत तिथि' : 'Registered', cell: (r) => formatDate(r.createdAt), sortable: true, sortValue: (r) => r.createdAt },
  ]

  const statusOk = Boolean(selected && DOWNLOADABLE_STATUSES.has(selected.status))
  const canDownload = Boolean(statusOk && activeCard?.id && !cardError)

  return (
    <div className="w-full space-y-6 pb-6 animate-fade-in">
      <PageHeader
        title={isHi ? 'ड्राइवर' : 'Drivers'}
        subtitle={isHi ? 'आपके जिले में सभी पंजीकृत ड्राइवर — स्वीकृत आवेदन का आईडी कार्ड डाउनलोड करें' : 'Registered drivers in your district — download ID cards after admin approval'}
      />
      {isLoading && !driverRes ? (
        <SkeletonTable />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          data={drivers}
          columns={columns}
          getRowKey={(r) => r.id}
          searchable
          onRowClick={setSelected}
          pagination={{
            page,
            pageSize: 10,
            totalItems: driverRes?.total ?? 0,
            totalPages: driverRes?.pages ?? 1,
            onPageChange: setPage,
            searchValue: search,
            onSearchChange: (v) => { setSearch(v); setPage(1) },
          }}
          emptyState={<EmptyState icon={Users} title={isHi ? 'कोई ड्राइवर नहीं मिला' : 'No drivers found'} />}
        />
      )}
      <AppDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        loading={opening}
        title={selected ? (isHi && nameTranslations[selected.name] ? nameTranslations[selected.name] : selected.name) : ''}
        footerMode="inline"
        footer={
          selected ? (
            <div className="w-full space-y-2">
              <Button
                className="w-full cursor-pointer"
                onClick={() => void handleDownload()}
                loading={opening || (statusOk && cardLoading)}
                loadingText={isHi ? 'खोला जा रहा है…' : 'Opening…'}
                disabled={!canDownload || opening || cardLoading}
              >
                <Download className="h-4 w-4" /> {isHi ? 'आईडी कार्ड डाउनलोड करें' : 'Download ID Card'}
              </Button>
              {!canDownload && !cardLoading && (
                <p className="text-xs text-center text-neutral-500">
                  {!statusOk
                    ? (isHi
                      ? 'एडमिन स्वीकृति के बाद ही डाउनलोड उपलब्ध होगा।'
                      : 'Available after admin approval.')
                    : (isHi ? 'अभी तक कोई आईडी कार्ड नहीं बना।' : 'No ID card record yet.')}
                </p>
              )}
              {activeCard?.id && !cardLoading && (
                <Button
                  variant="destructive"
                  className="w-full cursor-pointer"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4" /> {isHi ? 'आईडी कार्ड हटाएं' : 'Delete ID Card'}
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {selected && (
          <div className="space-y-4">
            <AvatarWithInitials name={selected.name} imageUrl={selected.photoUrl} size="lg" />
            <dl className="space-y-2 text-sm">
              {[
                [isHi ? 'सदस्य नंबर' : 'Member No', selected.memberNumber ?? '—'],
                [isHi ? 'लाइसेंस नंबर' : 'License', selected.licenseNumber],
                [isHi ? 'रक्त समूह' : 'Blood Group', selected.bloodGroup],
                [isHi ? 'स्थिति' : 'Status', translateStatus(selected.status)],
                [isHi ? 'कार्ड नंबर' : 'Card No', activeCard?.cardNumber ?? '—'],
                [isHi ? 'पंजीकृत तिथि' : 'Registered', formatDate(selected.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-neutral-100 pb-1.5">
                  <dt className="text-neutral-500">{k}</dt>
                  <dd className="font-medium text-neutral-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </AppDrawer>

      <AppModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        loading={deleteCard.isPending}
        title={isHi ? 'आईडी कार्ड हटाएं' : 'Delete ID Card'}
        description={
          isHi
            ? `क्या आप वाकई ${selected?.name ?? ''} का आईडी कार्ड (${activeCard?.cardNumber ?? ''}) हटाना चाहते हैं? यह कार्ड नंबर उसी जिले में अगले जारी किए गए कार्ड को दिया जाएगा।`
            : `Delete the ID card for ${selected?.name ?? ''} (${activeCard?.cardNumber ?? ''})? This card number will be reused by the next card issued in this district.`
        }
        footer={
          <Button
            variant="destructive"
            className="w-full cursor-pointer"
            onClick={handleDelete}
            loading={deleteCard.isPending}
            loadingText={isHi ? 'हटाया जा रहा है…' : 'Deleting…'}
          >
            {isHi ? 'हटाने की पुष्टि करें' : 'Confirm Delete'}
          </Button>
        }
      >
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {isHi
            ? 'यह कार्रवाई पूर्ववत नहीं की जा सकती। इस कार्ड की जानकारी सूची से हट जाएगी।'
            : 'This cannot be undone. The card will no longer appear anywhere in the system.'}
        </p>
      </AppModal>
    </div>
  )
}
