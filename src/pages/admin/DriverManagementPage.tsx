import { useState } from 'react'
import { toast } from 'sonner'
import { useDrivers } from '@/hooks/useDrivers'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { ErrorState } from '@/components/shared/ErrorState'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils/formatters'
import type { Driver, DriverStatus } from '@/types/driver.types'
import { Download } from 'lucide-react'

export default function DriverManagementPage() {
  const [status, setStatus] = useState<DriverStatus | 'all'>('all')
  const [district, setDistrict] = useState<string>('all')
  const { data, isLoading, isError, refetch } = useDrivers({ status, district: district === 'all' ? undefined : district })

  const columns: ColumnDef<Driver>[] = [
    { key: 'name', header: 'Name', cell: (r) => r.name, sortable: true, sortValue: (r) => r.name },
    { key: 'mobile', header: 'Mobile', cell: (r) => r.mobile },
    { key: 'district', header: 'District', cell: (r) => r.district },
    { key: 'license', header: 'License', cell: (r) => r.licenseNumber },
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge variant={statusToVariant(r.status)} label={r.status} /> },
    { key: 'created', header: 'Registered', cell: (r) => formatDate(r.createdAt) },
  ]

  const exportData = () => {
    toast.success(`Exported ${data?.length ?? 0} driver records`)
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Driver Management"
        subtitle="National driver database with advanced filters"
        action={<Button variant="outline" onClick={exportData}><Download className="h-4 w-4" /> Export</Button>}
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(['pending', 'approved', 'payment_confirmed', 'id_generated', 'expired', 'rejected'] as const).map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={district} onValueChange={setDistrict}>
          <SelectTrigger className="w-44"><SelectValue placeholder="District" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {['Lucknow', 'Ahmedabad', 'Mumbai', 'Delhi', 'Jaipur'].map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isLoading && <SkeletonTable />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (
        <DataTable data={data ?? []} columns={columns} getRowKey={(r) => r.id} searchable />
      )}
    </div>
  )
}
