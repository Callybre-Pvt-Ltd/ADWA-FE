import { useTranslation } from 'react-i18next'
import { useRenewals } from '@/hooks/useDrivers'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/utils/formatters'
import type { Driver } from '@/types/driver.types'
import { RefreshCw } from 'lucide-react'
import { nameTranslations } from '@/utils/translations'

function getUrgency(expiry?: string): 'danger' | 'warning' | 'neutral' {
  if (!expiry) return 'neutral'
  const days = (new Date(expiry).getTime() - Date.now()) / 86400000
  if (days < 0) return 'danger'
  if (days < 30) return 'warning'
  return 'neutral'
}

const statusMapEnToHi: Record<string, string> = {
  'APPROVED': 'स्वीकृत',
  'ID_CARD_GENERATED': 'आईडी कार्ड जनरेट हुआ',
  'ACTIVE': 'सक्रिय',
  'SUSPENDED': 'निलंबित',
  'EXPIRED': 'समाप्त',
}

export default function RenewalsPage() {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'
  const { data, isLoading, isError, refetch } = useRenewals()

  const translateStatus = (s: string) => {
    if (!isHi) return s.replace(/_/g, ' ')
    return statusMapEnToHi[s] || s.replace(/_/g, ' ')
  }

  const columns: ColumnDef<Driver>[] = [
    {
      key: 'name',
      header: isHi ? 'नाम' : 'Name',
      cell: (r) => isHi ? (nameTranslations[r.name] || r.name) : r.name,
      sortable: true,
      sortValue: (r) => r.name
    },
    { key: 'cardId', header: isHi ? 'कार्ड आईडी' : 'Card ID', cell: (r) => r.cardId ?? '—' },
    { key: 'expiry', header: isHi ? 'समाप्ति तिथि' : 'Expiry', cell: (r) => formatDate(r.expiryDate ?? r.licenseExpiryDate), sortable: true },
    {
      key: 'urgency', header: isHi ? 'अतिआवश्यकता' : 'Urgency',
      cell: (r) => {
        const v = getUrgency(r.expiryDate)
        const label = v === 'danger'
          ? (isHi ? 'समाप्त' : 'Expired')
          : v === 'warning'
          ? (isHi ? 'जल्द ही देय' : 'Due Soon')
          : (isHi ? 'आगामी' : 'Upcoming')
        return <StatusBadge variant={v === 'neutral' ? 'info' : v} label={label} dot />
      },
    },
    { key: 'status', header: isHi ? 'स्थिति' : 'Status', cell: (r) => <StatusBadge variant={statusToVariant(r.status)} label={translateStatus(r.status)} /> },
  ]

  return (
    <div className="w-full space-y-6 pb-6 animate-fade-in">
      <PageHeader
        title={isHi ? 'सदस्यता नवीनीकरण' : 'Renewals'}
        subtitle={isHi ? 'समाप्त या समाप्त होने वाली सदस्यता वाले ड्राइवर' : 'Drivers with expiring or expired memberships'}
      />
      {isLoading && <SkeletonTable />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (
        <DataTable
          data={data ?? []}
          columns={columns}
          getRowKey={(r) => r.id}
          searchable
          emptyState={
            <EmptyState
              icon={RefreshCw}
              title={isHi ? 'कोई नवीनीकरण लंबित नहीं' : 'No renewals pending'}
              description={isHi ? 'सभी सदस्यताएँ अद्यतित हैं।' : 'All memberships are up to date.'}
            />
          }
        />
      )}
    </div>
  )
}
