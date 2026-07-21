import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useDrivers, useDriverCards } from '@/hooks/useDrivers'
import { cardsService } from '@/services'
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

export default function DriversPage() {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'
  const { data, isLoading, isError, refetch } = useDrivers()
  const { data: cards } = useDriverCards()
  const [selected, setSelected] = useState<Driver | null>(null)
  const [downloading, setDownloading] = useState(false)

  const cardByDriver = useMemo(() => {
    const map = new Map<string, string>()
    cards?.forEach(card => map.set(card.driverId, card.id))
    return map
  }, [cards])

  const translateStatus = (s: string) => {
    if (!isHi) return s.replace(/_/g, ' ')
    return statusMapEnToHi[s] || s.replace(/_/g, ' ')
  }

  const handleDownload = async (driverId: string) => {
    if (downloading) return
    const cardId = cardByDriver.get(driverId)
    if (!cardId) {
      toast.error(isHi ? 'इस ड्राइवर के लिए कोई आईडी कार्ड नहीं मिला' : 'No ID card found for this driver')
      return
    }
    setDownloading(true)
    try {
      await cardsService.downloadPdf(cardId)
      toast.success(isHi ? 'कार्ड डाउनलोड होना शुरू हो गया है' : 'Card download started')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (isHi ? 'डाउनलोड विफल रहा' : 'Download failed'))
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

  const selectedCardId = selected ? cardByDriver.get(selected.id) : undefined

  return (
    <div className="w-full space-y-6 pb-6 animate-fade-in">
      <PageHeader
        title={isHi ? 'ड्राइवर' : 'Drivers'}
        subtitle={isHi ? 'आपके जिले में सभी पंजीकृत ड्राइवर' : 'All registered drivers in your district'}
      />
      {isLoading && <SkeletonTable />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (
        <DataTable
          data={data ?? []}
          columns={columns}
          getRowKey={(r) => r.id}
          searchable
          onRowClick={setSelected}
          emptyState={<EmptyState icon={Users} title={isHi ? 'कोई ड्राइवर नहीं मिला' : 'No drivers found'} />}
        />
      )}
      <AppDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        loading={downloading}
        title={selected ? (isHi && nameTranslations[selected.name] ? nameTranslations[selected.name] : selected.name) : ''}
        footer={selectedCardId ? (
          <Button
            className="w-full cursor-pointer"
            onClick={() => selected && handleDownload(selected.id)}
            loading={downloading}
            loadingText={isHi ? 'डाउनलोड हो रहा है…' : 'Downloading…'}
          >
            <Download className="h-4 w-4" /> {isHi ? 'आईडी कार्ड डाउनलोड करें' : 'Download ID Card'}
          </Button>
        ) : undefined}
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
                [isHi ? 'पंजीकृत तिथि' : 'Registered', formatDate(selected.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-neutral-100 pb-1.5">
                  <dt className="text-neutral-500">{k}</dt>
                  <dd className="font-medium text-neutral-900">{v}</dd>
                </div>
              ))}
            </dl>
            {!selectedCardId && (
              <p className="text-sm text-orange-700 bg-orange-50 rounded-lg p-3">
                {isHi ? 'अभी तक कोई आईडी कार्ड जनरेट नहीं किया गया है।' : 'No ID card generated yet.'}
              </p>
            )}
          </div>
        )}
      </AppDrawer>
    </div>
  )
}
