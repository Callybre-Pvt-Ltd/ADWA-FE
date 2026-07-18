import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuditLogs } from '@/hooks/useAuditLogs'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { ErrorState } from '@/components/shared/ErrorState'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDateTime } from '@/utils/formatters'
import type { AuditLog } from '@/types/common.types'

const actionTranslations: Record<string, string> = {
  'LOGIN': 'लॉगिन',
  'UPDATE': 'अपडेट',
  'CREATE': 'बनाएं',
  'DELETE': 'हटाएं',
  'APPROVE': 'स्वीकृत',
  'REJECT': 'अस्वीकृत',
}

const translateAction = (action: string, isHi: boolean) => {
  if (!isHi) return action
  if (actionTranslations[action]) {
    return actionTranslations[action]
  }
  const parts = action.split(' · ')
  if (parts.length === 2) {
    const verb = parts[0] === 'CREATE' ? 'बनाया गया' : parts[0] === 'UPDATE' ? 'संशोधित किया गया' : parts[0] === 'DELETE' ? 'हटाया गया' : parts[0] === 'APPROVE' ? 'स्वीकृत किया गया' : parts[0] === 'REJECT' ? 'अस्वीकृत किया गया' : parts[0]
    const noun = parts[1] === 'DRIVER_REQUEST' ? 'ड्राइवर अनुरोध को' : parts[1] === 'USER' ? 'प्रभारी खाता को' : parts[1] === 'DISTRICT' ? 'जिला को' : parts[1] === 'EVENT' ? 'कार्यक्रम को' : parts[1]
    return `${noun} ${verb}`
  }
  return action
}

const translateEntity = (entity: string, isHi: boolean) => {
  if (!isHi) return entity
  switch (entity) {
    case 'DRIVER_REQUEST': return 'ड्राइवर अनुरोध'
    case 'USER': return 'उपयोगकर्ता'
    case 'DISTRICT': return 'जिला'
    case 'EVENT': return 'कार्यक्रम'
    default: return entity
  }
}

const actorTypeTranslations: Record<string, string> = {
  'admin': 'एडमिन',
  'district': 'जिला',
  'system': 'सिस्टम',
}

export default function AuditLogsPage() {
  const { i18n } = useTranslation('dashboard')
  const isHi = i18n.language === 'hi'
  const [actorType, setActorType] = useState<string>('all')
  const { data, isLoading, isError, refetch } = useAuditLogs({ actorType: actorType as 'all' })

  const translateActorType = (at: string) => {
    if (!isHi) return at
    return actorTypeTranslations[at] || at
  }

  const columns: ColumnDef<AuditLog>[] = [
    { key: 'actor', header: isHi ? 'कर्ता' : 'Actor', cell: (r) => r.actor, sortable: true, sortValue: (r) => r.actor },
    { key: 'type', header: isHi ? 'प्रकार' : 'Type', cell: (r) => <StatusBadge variant={r.actorType === 'admin' ? 'primary' : r.actorType === 'system' ? 'neutral' : 'info'} label={translateActorType(r.actorType)} /> },
    { key: 'action', header: isHi ? 'कार्रवाई' : 'Action', cell: (r) => translateAction(r.action, isHi) },
    { key: 'entity', header: isHi ? 'इकाई' : 'Entity', cell: (r) => `${translateEntity(r.entity, isHi)} (${r.entityId})` },
    { key: 'time', header: isHi ? 'समय' : 'Timestamp', cell: (r) => formatDateTime(r.timestamp), sortable: true, sortValue: (r) => r.timestamp },
  ]

  return (
    <div className="w-full space-y-6 pb-6 animate-fade-in">
      <PageHeader
        title={isHi ? 'ऑडिट लॉग' : 'Audit Logs'}
        subtitle={isHi ? 'सिस्टम गतिविधि और परिवर्तन इतिहास' : 'System activity and change history'}
      />
      {isLoading && <SkeletonTable />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (
        <DataTable
          data={data ?? []}
          columns={columns}
          getRowKey={(r) => r.id}
          searchable
          searchPlaceholder={isHi ? 'लॉग खोजें...' : 'Search logs...'}
          actions={
            <Select value={actorType} onValueChange={setActorType} className="w-full sm:w-auto">
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder={isHi ? 'चुनें...' : 'Select...'} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isHi ? 'सभी कर्ता' : 'All Actors'}</SelectItem>
                <SelectItem value="admin">{isHi ? 'एडमिन' : 'Admin'}</SelectItem>
                <SelectItem value="district">{isHi ? 'जिला' : 'District'}</SelectItem>
                <SelectItem value="system">{isHi ? 'सिस्टम' : 'System'}</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      )}
    </div>
  )
}
