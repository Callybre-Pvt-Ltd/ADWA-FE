import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useDrivers, useDriverActiveCard } from '@/hooks/useDrivers'
import { cardsService, driversService } from '@/services'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import { AppDrawer } from '@/components/shared/AppDrawer'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { AvatarWithInitials } from '@/components/shared/AvatarWithInitials'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils/formatters'
import type { Driver } from '@/types/driver.types'
import { Download, Users } from 'lucide-react'
import { nameTranslations } from '@/utils/translations'

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
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Driver | null>(null)
  const [downloading, setDownloading] = useState(false)

  const { data: driverRes, isLoading, isError, refetch } = useDrivers({
    page,
    size: 10,
    search: search || undefined,
  })
  const drivers = driverRes?.items ?? []
  const { data: activeCard, isLoading: cardLoading, isError: cardError } = useDriverActiveCard(
    selected?.id ?? null,
  )

  const translateStatus = (s: string) => {
    if (!isHi) return s.replace(/_/g, ' ')
    return statusMapEnToHi[s] || s.replace(/_/g, ' ')
  }

  const handleDownload = async () => {
    if (downloading || !selected) return
    if (!DOWNLOADABLE_STATUSES.has(selected.status)) {
      toast.error(
        isHi
          ? 'एडमिन द्वारा स्वीकृत होने के बाद ही आईडी कार्ड डाउनलोड हो सकता है'
          : 'ID card can be downloaded only after admin approval',
      )
      return
    }
    setDownloading(true)
    try {
      const card = activeCard ?? (await driversService.getActiveCard(selected.id))
      await cardsService.downloadPdf(
        card.id,
        `ADWA-${selected.memberNumber || card.cardNumber}.pdf`,
      )
      toast.success(isHi ? 'कार्ड डाउनलोड होना शुरू हो गया है' : 'Card download started')
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : (isHi ? 'डाउनलोड विफल रहा' : 'Download failed'),
      )
    } finally {
      setDownloading(false)
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
        loading={downloading}
        title={selected ? (isHi && nameTranslations[selected.name] ? nameTranslations[selected.name] : selected.name) : ''}
        footerMode="inline"
        footer={
          selected ? (
            <div className="w-full space-y-2">
              <Button
                className="w-full cursor-pointer"
                onClick={() => void handleDownload()}
                loading={downloading || (statusOk && cardLoading)}
                loadingText={isHi ? 'डाउनलोड हो रहा है…' : 'Downloading…'}
                disabled={!canDownload || downloading || cardLoading}
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
    </div>
  )
}
